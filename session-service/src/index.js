import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import { checkHealth } from "./tools/GetUsers.js";
import logger from "../config/logger.js";
import env from "../config/env.js";
import WebSocketManager from "./WebSocketManager.js";
import prefix from "./tools/url.js";
import routes from "./API/routes.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Init Fastify app
let fastify;
if (env.nodeEnv === 'production') {
	// With cert in volumes
	// try {
	// 	fs.accessSync(`/etc/ssl/${env.domain_name}.key`, fs.constants.R_OK);
	// 	fs.accessSync(`/etc/ssl/${env.domain_name}.crt`, fs.constants.R_OK);
	// 	console.log("SSL certificates found and accessible");
	// } catch (err) {
	// 	console.error(err);
	// 	console.error("❌ Critical error : SSL certificates not found or inaccessible");
	// 	process.exit(1);
	// }

	// fastify = Fastify({
	// 	logger: logger,
	// 	https: {
	// 		key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
	// 		cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
	// 	}
	// });

	fastify = Fastify({
		logger: logger,
		https: {
			key: getSecret('ssl_key.key'),
			cert: getSecret('ssl_cert.crt')
		}
	});
	console.log("App launched in production mode");
}
else {
	fastify = Fastify({
		logger: false,
		ajv: { customOptions: {
			removeAdditional: false
		}}
	});
	console.log("App launched in development mode");
}

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.error("❌ Error reading secret ", name);
		process.exit(1);
	}
}

fastify.register(fastifyCookie,
{
    secret: getSecret('cookie_key')
});

// Register JWT plugin in fastify
fastify.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

fastify.decorate("authenticate", async function (request, reply)
{
	try 
	{
		// Check internal API key
		if (request.headers && request.headers['x-internal-api-key']) {
			const internalApiKey = request.headers['x-internal-api-key'];
			if (internalApiKey === getSecret('api_key'))
				return;
			else {
				return reply.code(401).send({ error: "Invalid API key" });
			}
		}
		else if (request.cookies && request.cookies.token)
		{		
			const result = fastify.unsignCookie(request.cookies.token); // Check cookie signature
			if (!result.valid)
				return reply.code(401).send({ error: "Invalid cookie" });
			request.user = await fastify.jwt.verify(result.value); // Check external JWT token from users and store their infos in request.user
			if (request.user.twofa_pending === true)
				return reply.code(401).send({ error: "2FA required" });
		} else {
			return reply.code(401).send({ error: "Authentication required" });
		}
	}
	catch (err)
	{
		console.log("❌ Error : ", err.message);
		return reply.code(401).send({error : err.message});
	}
});

fastify.decorate("int_authenticate", async function (request, reply)
{
	try 
	{
		if (!request.headers)
			return reply.code(401).send({ error: "Authentication required" });
		// Check internal API key only
		const internalApiKey = request.headers['x-internal-api-key'];
		if (internalApiKey)
			if (internalApiKey === getSecret('api_key')) {
				return;
			} else {
				return reply.code(401).send({ error: "Invalid API key" });
			}
		else {
			return reply.code(401).send({ error: "Authentication required" });
		}
	} 
	catch (err)
	{
		console.warn(`Internal auth refused to ${request.ip || request.headers['x-forwarded-for'] || ''}: `, err.message);
		return reply.code(401).send({error : err.message});
	}
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServiceHealth(url, timeout = 1000000, interval = 1000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const healthCheck = await checkHealth();
		if (healthCheck.ok) {
			return true;
		}
		await wait(interval);
	}
	console.error("❌ Timeout while health checking for ", url);
	process.exit(1);
}

async function launch_app() {
    const healthUrl = `${prefix}://user-service:${env.user_port}/health`;
    const state = await waitForServiceHealth(healthUrl, 60000);

    if (!state) {
        console.error("❌ Error: user-service health check failed, aborting.");
        process.exit(1);
    }

    // WebSocket server
	let createServer;
	if (env.nodeEnv === 'production') {
		({ createServer } = await import('https'));
	} else {
		({ createServer } = await import('http'));
	}

	// When cert is in volumes
	// const server = env.nodeEnv === 'production' ? createServer({
    //     key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
    //     cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
    // }) : createServer();

	const server = env.nodeEnv === 'production' ? createServer({
        key: getSecret('ssl_key.key'),
        cert: getSecret('ssl_cert.crt')
    }) : createServer();

    const wss = new WebSocketServer({ server, path: "/s-ws/" });
    console.log("Ws server created");

    const WSManager = new WebSocketManager(wss, fastify);
    WSManager.initializeWebSocket();
    try {
        await WSManager.getBaseInfos();
    } catch (error) {
        console.error("❌ Error launching fastify: ", error);
        process.exit(1);
    }
    fastify.decorate('WebSocketManager', WSManager);

    await fastify.register(routes);

    fastify.setNotFoundHandler((req, reply) => {
        reply.status(404).send("Not found");
    });

    fastify.get("/health", async (request, reply) => {
        return { status: "ok" };
    });

    fastify.listen({ port: env.session_port, host: `${env.ip}` }, (err, address) => {
        if (err) {
            console.error("❌ Error launching fastify: ", err);
            process.exit(1);
        }
        fastify.log.info(`Session API running at ${address}`);
    });

    server.listen(env.session_ws_port, () => {
        console.info('WebSocket server listening on port ', env.session_ws_port);
    });

	await WSManager.watchDelog();
}

launch_app();

