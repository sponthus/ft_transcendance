import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import ajvErrors from "ajv-errors";
import logger from "../config/logger.js";
import env from "../config/env.js";
import DatabaseConnector from "./API/database/DatabaseConnector.js";
import routes from "./API/routes.js";
import WebSocketManager from "./WebSocketManager.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Init Fastify app
let fastify;
if (env.nodeEnv === 'production') {
	try {
		fs.accessSync(`/etc/ssl/${env.domain_name}.key`, fs.constants.R_OK);
		fs.accessSync(`/etc/ssl/${env.domain_name}.crt`, fs.constants.R_OK);
		console.log("SSL certificates found and accessible");
	} catch (err) {
		console.error(err);
		console.error("❌ Critical error : SSL certificates not found or inaccessible");
		process.exit(1);
	}

	fastify = Fastify({
		logger: logger,
		ajv: {
			customOptions: {
				removeAdditional: false,
				allErrors: true
			},
			plugins: [ajvErrors]
		},
		schemaErrorFormatter: (errors, dataVar) => //DataVar (contexte) : body, params
        {
            const firstError = errors[0];
            const errorSchema =  { message: firstError.message };
            const err = new Error(errorSchema.message);
            err.validation = errorSchema;
            err.validationContext = dataVar;
            err.statusCode = 400;
            return err;
        },
		https: {
			key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
			cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
		}
	});
	console.log("App launched in production mode");
}
else {
	fastify = Fastify({
		logger: false,
		ajv: {
			customOptions: {
				removeAdditional: false,
				allErrors: true
			},
			plugins: [ajvErrors]
		},
		schemaErrorFormatter: (errors, dataVar) => //DataVar (contexte) : body, params
        {
            const firstError = errors[0];
            const errorSchema =  { message: firstError.message };
            const err = new Error(errorSchema.message);
            err.validation = errorSchema;
            err.validationContext = dataVar;
            err.statusCode = 400;
            return err;
        }
	});
	console.log("App launched in development mode");
}

fastify.register(DatabaseConnector);

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.error("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

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

fastify.register(fastifyCookie,
{
    secret: getSecret('cookie_key')
});

//enregistre le plugin JWT dans fastify
fastify.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

await fastify.register(routes);

// Default handler for undefined routes
fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send("Not found");
});

fastify.get("/health", async (request, reply) => {
    return { status: "ok" };
});

// Launch Fastify HTTP REST API on port ${env.game_port}
fastify.listen({ port: env.game_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Game API running at ${address}`);
});

// WebSocket server on port ${env.game_ws_port}
let createServer;
if (env.nodeEnv === 'production') {
	({ createServer } = await import('https'));
} else {
	({ createServer } = await import('http'));
}
const server = env.nodeEnv === 'production' ? createServer({
	key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
	cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
}) : createServer();
// const server = createServer();
const wss = new WebSocketServer({ server, path: "/g-ws/" });
console.log("Ws server created");
const WSManager = new WebSocketManager(wss, fastify);
WSManager.initializeWebSocket();

server.listen(env.game_ws_port, () => {
    console.log('WebSocket server listening on port ', env.game_ws_port);
});

