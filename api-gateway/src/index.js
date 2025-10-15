import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
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

// fastify.register(fastifyJwt, {
//     secret: env.hashKey,
// });

// fastify.decorate("authenticate", async function (request, reply) {
//     try {
//         await request.jwtVerify();
//     } catch (err) {
//         console.error("JWT error:", err);
//         reply.code(401).send({ error: "Unauthorized" });
//     }
// });

fastify.addHook('onRequest', async (request, reply) => {
    // console.debug(`[GATEWAY] ${request.method} ${request.url}`);
    if (request.body) {
        // console.debug('[GATEWAY BODY]', request.body);
    }
});

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
fastify.listen({ port: env.api_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});
