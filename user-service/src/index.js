import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import { fileURLToPath } from "url"; // Transforms ESM paths to system paths
import path from 'path'; // utilities for working with file and directory paths
import env from "../config/env.js";
import dbConnector from "./db.js";
import logger from "../config/logger.js";
import routes from "./routes/newRoutes.js";

const __filename = fileURLToPath(import.meta.url); // This filename, from ESM expression to classic path
export const __dirname = path.dirname(__filename); // Parent folder to this file

const fastify = Fastify({
    logger: logger,
});

console.log('\nFastify user-service listen on port 3001\n'); // debug

fastify.decorate("authenticate", async function (request, reply)
{
    try 
    {
        await request.jwtVerify(); //Décode et verifie le token et stock ses infos dans request
        console.log("Decoded token:", request.user);
    } 
    catch (err)
    {
        return reply.code(401).send({error : err.message});
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

//enregistre le plugin JWT dans fastify
fastify.register(fastifyJwt, {
    secret: env.hashKey,
});

fastify.register(dbConnector);

await fastify.register(routes);

 fastify.get('/', async (req, reply) => {
     return { message: 'User service received your request!' };
 });

// Default handler for undefined routes
fastify.setNotFoundHandler((req, reply) => {
    // Extension = file
    console.log("ERREUR 404");
    reply.status(404).send("Not found");
});

// Fastify listens
// TODO : Set port in env
fastify.listen({ port: 3001, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});