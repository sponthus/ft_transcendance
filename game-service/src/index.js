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
import routes from "./routes.js";
import WebSocketManager from "./WebSocketManager.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Init Fastify app
const app = Fastify({
    logger: logger,
});

app.register(DatabaseConnector);

app.decorate("authenticate", async function (request, reply)
{
    try 
    {
		// console.log("Verifying token");
		await request.jwtVerify(); //Décode et verifie le token et stock ses infos dans request
        // console.log("Decoded token:", request.user);
    } 
    catch (err)
    {
		console.log("❌ Error : ", err.message);
        return reply.code(401).send({error : err.message});
    }
});

function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.log("❌ Critical error : Unable to read secret ", name);
		// process.exit(1);
	}
}

//enregistre le plugin JWT dans fastify
app.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

await app.register(routes);

// Default handler for undefined routes
app.setNotFoundHandler((req, reply) => {
    reply.status(404).send("Not found");
});

// Lancer Fastify HTTP REST API sur le port 3002
app.listen({ port: env.game_port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`Game API running at ${address}`);
});

// WebSocket server on port 4000
const server = createServer();
const wss = new WebSocketServer({ server, path: "/ws/" });
console.log("Ws server created");

const WSManager = new WebSocketManager(wss);

server.listen(env.ws_port, () => {
    console.log('WebSocket server listening on port ', env.ws_port);
});

