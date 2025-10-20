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
		https: {
			key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
			cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
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

// Protection of
// Limits requests from a specific IP :: 100 every 100 seconds
// Otherwise gives a 429 code
await fastify.register(rateLimit, {
    global: true,
    max: 1000, // too change to 100
    timeWindow: '100 seconds'
});

fastify.addHook('onRequest', async (request, reply) => {
	console.debug("On request hook");
	if (request.raw && typeof request.raw.url === 'string' && request.raw.url.startsWith('/api/avatars')) {
        console.log("Skipping preHandler for upload route:", request.raw.url);
        console.log("Gateway headers (raw):", request.raw.headers);
        console.log("Gateway content-type:", request.headers['content-type']);
		return;
    }
	if (['GET', 'DELETE'].includes(request.method)) {
		const cl = request.headers['content-length'];
		const te = request.headers['transfer-encoding'];
		if ((cl && !isNaN(Number(cl)) && Number(cl) > 0) || te) {
			reply.code(400).send({ error: 'Body not allowed' });
			return;
		}
	} else {
		console.log("Request method is ", request.method);
	}

	if (env.nodeEnv === 'production' && !host.includes(env.host)) {
		const host = request.headers['host'];
		if (!host || typeof host !== 'string') {
			reply.code(400).send({ error: 'Missing or invalid host header' });
			return;
		}
		reply.code(400).send({ error: 'Host header does not match' });
		return;
	}

});

fastify.addHook('preHandler', async (request, reply) => {
	console.debug("Pre handler hook");
	if (request.raw && typeof request.raw.url === 'string' && request.raw.url.startsWith('/api/avatars')) {
        console.log("Skipping preHandler for upload route:", request.raw.url);
        console.log("Gateway headers (raw):", request.raw.headers);
        console.log("Gateway content-type:", request.headers['content-type']);
		return;
    }
	if (['GET', 'DELETE'].includes(request.method) 
		&& request.body 
		&& Object.keys(request.body).length > 0) {
		reply.code(400).send({ error: 'Body not allowed' });
		return;
	} else {
		console.log("Request method is ", request.method);
	}
	const host = request.headers['host'];
	if (env.nodeEnv === 'production' 
		&& !host.includes(env.host)
		&& !host.includes(`api-gateway:${env.api_port}`)) {
		if (!host || typeof host !== 'string') {
			reply.code(400).send({ error: 'Missing or invalid host header' });
			return;
		}
		reply.code(400).send({ error: 'Host header does not match' });
		return;
	} else {
		console.log("Host header is valid: ", host);
	}
});

// Protection of attacks looking for valid URL by hardly protecting 404
fastify.setNotFoundHandler({
    preHandler: fastify.rateLimit({
        max: 10,
        timeWindow: '60 seconds'
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

// // Default handler for undefined routes
// fastify.setNotFoundHandler((req, reply) => {
//     // Extension = file
//     if (req.raw.url.includes(".")) {
//         reply.status(404).send("Not found");
//     } else {
//         reply.sendFile("index.html");
//     }
// });

// Fastify listens
console.debug('ENV : ', env.ip);
fastify.listen({ port: env.api_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});
console.debug('LAAA');
