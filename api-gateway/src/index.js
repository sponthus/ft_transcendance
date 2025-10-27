import Fastify from "fastify";
import proxy from "@fastify/http-proxy";
import rateLimit from "@fastify/rate-limit";
import { fileURLToPath } from "url"; // Transforms ESM paths to system paths
import path from 'path'; // utilities for working with file and directory paths
import env from "../config/env.js";
import logger from "../config/logger.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url); // This filename, from ESM expression to classic path
export const __dirname = path.dirname(__filename); // Parent folder to this file

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
    //     logger: logger,
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
	console.log("fastify launched in production mode");
}
else {
	fastify = Fastify({
		logger: false,
	});
	console.log("fastify launched in development mode");
}

console.log('Parameters for fastify are being set ...'); // debug

// Protection of limit requests from a specific IP :: 100 every 100 seconds
// Otherwise gives a 429 code
function isTrustedRequest(request) {
	const ip = request.ip ? request.ip : '';
	// console.log("IP address is ", ip);
	if (ip === 'localhost' || ip === env.host) 
		return true;

	return false;
}

await fastify.register(rateLimit, {
    global: true,
    max: 1000,
    timeWindow: '100 seconds',
    allowList: (request) => isTrustedRequest(request)
});

fastify.addHook('onRequest', async (request, reply) => {
	// console.debug("On request hook");
	if (!request) {
		console.warn('Missing request object');
		reply.code(400).send({ error: 'Invalid request' });
		return;
	}

	if (['GET'].includes(request.method)) {
		const cl = request.headers['content-length'];
		const te = request.headers['transfer-encoding'];
		if (!request.raw.url.startsWith('/api/user/menu/friendlist')) {
			if ((cl && !isNaN(Number(cl)) && Number(cl) > 0) || te) {
				console.warn('GET request with body detected');
				reply.code(400).send({ error: 'Body not allowed' });
				return;
			}
		}
		// Health requests has no body and no header
		if (request.raw.url.startsWith('/health')) {
			return;
		}
	} else {
		// console.debug("Request method is ", request.method);

		// Validate method
		if (!request.method) {
			console.warn('Missing request method');
			reply.code(400).send({ message: 'Invalid request method' });
			return;
		} else if (request.method !== request.method.toUpperCase()) {
			console.warn('Invalid request method format: ', request.method);
			reply.code(400).send({ message: 'Invalid request method format' });
			return;
		} else if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
			console.warn('Invalid request method detected: ', request.method);
			reply.code(400).send({ message: 'Invalid request method' });
			return;
		}

		// Validate content-type
		const ct = request.headers['content-type'];
		// All requests use content-type = json except avatar upload
		if (!request.raw.url.startsWith('/api/avatars') && ct && ct !== 'application/json') {
			console.warn('Invalid content-type detected: ', ct);
			reply.code(400).send({ message: 'Invalid content-type for request' });
			return;
		} else if (request.raw.url.startsWith('/api/avatars') && ct && !ct.startsWith('multipart/form-data')) {
			console.warn('Invalid content-type detected for avatar upload: ', ct);
			reply.code(400).send({ message: 'Invalid content-type for avatar upload' });
			return;
		} else if (!ct) {
			console.warn('Missing content-type header');
			reply.code(400).send({ message: 'Missing content-type for request' });
			return;
		} // Game POST request has game in address so no body
	}

	// Validate host header in production
	const host = request.headers['host'];
	if (env.nodeEnv === 'production') {
		if (!host || typeof host !== 'string') {
			console.warn('Missing or invalid host header');
			reply.code(400).send({ message: 'Missing or invalid host header' });
			return;
		}
		if (!host.includes(env.host)
			&& !host.startsWith(`api-gateway`)
		    && !host.startsWith(`localhost`)) {
			console.warn(`Host header does not match /${env.host}/ : /${host}/`);
			reply.code(400).send({ message: 'Host header does not match' });
		}
		return;
	}
});

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.error("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

// Protection of attacks looking for valid URL by hardly protecting 404
fastify.setNotFoundHandler({
    preHandler: fastify.rateLimit({
        max: 100,
        timeWindow: '60 seconds',
		allowList: ['localhost', env.host],
    })
}, function (request, reply) {
    reply.code(404).send({ error: 'Not found' })
});

console.log('Rate limit set'); // debug

let prefix = 'http';
if (env.nodeEnv === 'production') {
	prefix = 'https';
}

fastify.register(proxy, {
    upstream: `${prefix}://user-service:${env.user_port}`,
    prefix: '/api/user',
    rewritePrefix: '/',
    body: true,
    http2: false // Security
});

fastify.register(proxy, {
    upstream: `${prefix}://game-service:${env.game_port}`,
    prefix: '/api/games',
    rewritePrefix: '/',
    body: true,
    http2: false
});

fastify.register(proxy, {
    upstream: `${prefix}://upload-service:${env.upload_port}`,
    prefix: '/api/avatars',
	body: false,
    rewritePrefix: '/',
    http2: false,
});

fastify.register(proxy, {
    upstream: `${prefix}://session-service:${env.session_port}`,
    prefix: '/api/session',
    rewritePrefix: '/',
    http2: false,
});

fastify.get("/health", async (request, reply) => {
	console.log("Health check received");
    return { status: "ok" };
});

console.log("Routes set"); // debug

// Default handler for undefined routes
// fastify.setNotFoundHandler((req, reply) => {
//     // Extension = file
//     if (req.raw.url.includes(".")) {
//         reply.status(404).send("Not found");
//     } else {
//         reply.sendFile("index.html");
//     }
// });

// Fastify listens
fastify.listen({ port: env.api_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});
