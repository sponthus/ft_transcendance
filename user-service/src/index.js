import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import { fileURLToPath } from "url"; // Transforms ESM paths to system paths
import path from 'path'; // utilities for working with file and directory paths
import env from "../config/env.js";
import fs from "fs";
import dbConnector from "./db.js";
import logger from "../config/logger.js";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url); // This filename, from ESM expression to classic path
export const __dirname = path.dirname(__filename); // Parent folder to this file

const fastify = Fastify({
    logger: false,
});

console.log(`\nFastify user-service listen on port ${env.user_port}\n`); // debug

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.log("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

fastify.decorate("verifyApiKey", async function (request, reply)
{
    const   apiKey = request.headers['x-internal-api-key'];
    if (!apiKey || apiKey !== getSecret('api_key'))
		return reply.code(401).send({ error: 'Unauthorized: Invalid API Key' });
});

fastify.decorate("authenticate", async function (request, reply)
{
    try 
    {
        await request.jwtVerify(); //Décode et verifie le token et stock ses infos dans request
        console.log("Decoded token:", request.user);
        if (request.user.twofa_pending === true)
            return reply.code(401).send({ error: "2FA required" });
    } 
    catch (err)
    {
        if (err.message === "Authorization token expired")
        {
            return reply.code(401).send({error : err.message});
        }
        else
        {
            return reply.code(400).send({error : err.message});
        }
    }
    /*try
    {
        const db = request.server.db;
        const idUser = request.user.idUser;
        const userExists = db.prepare(" SELECT \
                                            1 \
                                        FROM \
                                            users \
                                        WHERE \
                                            idUser = ?").get(idUser);
        if (!userExists)
            return reply.code(404).send({ error: "User not found" });

    }
    catch (err)
    {
        return reply.code(500).send( {error : "Internal Server Error" + err.message} );
    }*/
    
});


fastify.setErrorHandler((error, request, reply) => {
    console.error("⚠️ ERROR GLOBAL CAPTURED");
    console.error("Route:", request.routerPath);
    console.error("Method:", request.method);
    console.error("Body:", request.body);
    console.error("Headers:", request.headers);
    console.error("Error stack:", error.stack);

    // On renvoie un JSON générique pour l’utilisateur
    reply.status(error.statusCode || 500).send({
        error: error.message || "Internal Server Error"
    });
});




//enregistre le plugin JWT dans fastify
fastify.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

fastify.register(dbConnector);

await fastify.register(routes);

// Health check to synchronize initialization of session service
fastify.get("/health", async (request, reply) => {
    return { status: "ok" };
});

fastify.get('/', async (req, reply) => {
     return { message: 'User service received your request!' };
});

// Default handler for undefined routes
fastify.setNotFoundHandler((req, reply) => {
    // Extension = file
   // console.log("ERREUR 404");
    console.log("ERREUR 404", {
        url: req.url,
        method: req.method,
        headers: req.headers
    });
    reply.status(404).send("Not found");
});

// Fastify listens
fastify.listen({ port: env.user_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});
