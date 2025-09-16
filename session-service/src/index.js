import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import { createServer } from "http";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";

import logger from "../config/logger.js";
import env from "../config/env.js";
import WebSocketManager from "./WebSocketManager.js";

import routes from "./API/routes.js";
// import WebSocketManager from "./WebSocketManager.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Init Fastify app
const fastify = Fastify({
	logger: logger,
});

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.error("❌ Error reading secret ", name);
		process.exit(1);
	}
}

// Register JWT plugin in fastify
fastify.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

fastify.decorate("authenticate", async function (request, reply)
{
	try 
	{
		// Check internal API key
		const internalApiKey = request.headers['x-internal-api-key'];
		if (internalApiKey && internalApiKey === getSecret('api_key')) {
			return;
	}
		// Check external JWT token from users and store their infos in request.user
		await request.jwtVerify();
		// console.log("Decoded token:", request.user);
	} 
	catch (err)
	{
		console.error("Auth refused: ", err.message);
		return reply.code(401).send({error : err.message});
	}
});

fastify.decorate("int_authenticate", async function (request, reply)
{
	try 
	{
		// Check internal API key only
		const internalApiKey = request.headers['x-internal-api-key'];
		if (internalApiKey && internalApiKey === getSecret('api_key')) {
			return;
		}
	} 
	catch (err)
	{
		console.error("Auth refused: ", err.message);
		return reply.code(401).send({error : err.message});
	}
});

await fastify.register(routes);

// Default handler for undefined routes
fastify.setNotFoundHandler((req, reply) => {
	reply.status(404).send("Not found");
});

// Launch Fastify HTTP REST API on port ${env.session_port}
fastify.listen({ port: env.session_port, host: `${env.ip}` }, (err, address) => {
	if (err) {
		console.error("❌ Error launching fastify: ", err);
		process.exit(1);
	}
	fastify.log.info(`Session API running at ${address}`);
});

// WebSocket server on port ${env.session_ws_port}
const server = createServer();
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

// const WSManager = new WebSocketManager(wss);
server.listen(env.session_ws_port, () => {
	console.info('WebSocket server listening on port ', env.session_ws_port);
});

