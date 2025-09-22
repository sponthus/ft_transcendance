import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import { createServer } from "http";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";

import logger from "../config/logger.js";
import env from "../config/env.js";

import DatabaseConnector from "./API/database/DatabaseConnector.js";
import routes from "./API/routes.js";
import WebSocketManager from "./WebSocketManager.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Init Fastify app
const app = Fastify({
    logger: logger,
});

app.register(DatabaseConnector);

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.log("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

app.decorate("authenticate", async function (request, reply)
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
		console.log("❌ Error : ", err.message);
        return reply.code(401).send({error : err.message});
    }
});


//enregistre le plugin JWT dans fastify
app.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

await app.register(routes);

// Default handler for undefined routes
app.setNotFoundHandler((req, reply) => {
    reply.status(404).send("Not found");
});

// Launch Fastify HTTP REST API on port ${env.game_port}
app.listen({ port: env.game_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`Game API running at ${address}`);
});

// WebSocket server on port ${env.game_ws_port}
const server = createServer();
const wss = new WebSocketServer({ server, path: "/g-ws/" });
console.log("Ws server created");

const WSManager = new WebSocketManager(wss, app);
WSManager.initializeWebSocket();

server.listen(env.game_ws_port, () => {
    console.log('WebSocket server listening on port ', env.game_ws_port);
});

