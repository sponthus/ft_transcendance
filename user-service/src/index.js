import Fastify from "fastify";
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from "@fastify/cookie";
import { fileURLToPath } from "url"; // Transforms ESM paths to system paths
import path from 'path'; // utilities for working with file and directory paths
import env from "../config/env.js";
import fs from "fs";
import dbConnector from "./db.js";
import logger from "../config/logger.js";
import routes from "./routes/index.js";
import { initOAuthGithub } from "./connection/OAuthGithub.js";
import { refreshToken } from "./tools/refreshToken.js";
//import { getSecret } from "./tools/getSecret.js";

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
	console.log("App launched in production mode");
}
else {
	fastify = Fastify({
		logger: false,
	});
	console.log("App launched in development mode");
}

console.log(`\nFastify user-service listen on port ${env.user_port}\n`); // debug

fastify.register(fastifyCookie,
{
    secret: getSecret('cookie_key')
});

fastify.register(fastifyJwt, 
{
	secret: getSecret('hash_key'),
});

initOAuthGithub(fastify);

export function getSecret(name)
{
	try
    {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	}
    catch (error)
    {
		console.log("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

fastify.decorate("verifyApiKey", async function (request, reply)
{
    console.log('PASSSSSEEEE PAR LA VERIFICATION API KEY');
    const   apiKey = request.headers['x-internal-api-key'];
    if (!apiKey || apiKey !== getSecret('api_key'))
		return reply.code(401).send({ error: 'Unauthorized: Invalid API Key' });

    console.log('request.body :', request.body);
    console.log('request.body type :', typeof request.body);

    console.log('FINNNIII  LA VERIFICATION API KEY');
});

fastify.decorate("authenticate_2fa", async function (request, reply)
{
    try 
    {
        const result = fastify.unsignCookie(request.cookies.token); 
        if (!result.valid)
            return reply.code(401).send({ error: "Invalid cookie" });
        request.user = await fastify.jwt.verify(result.value);
        // console.debug("Decoded token 2fa : ", request.user);
        if (request.user.twofa_pending === false)
            return reply.code(401).send({ error: "only tmp token" });
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
});

fastify.decorate("authenticate", async function (request, reply)
{
    //TODO PENSEZ A VERIFIER SI LE USER EXISTE ET LE RESTE DES TABLLES ?
    try 
    {
        // console.debug("\nToken dans le user-service avant unsign cookie : -" + request.cookies.token + "-");
        const result = fastify.unsignCookie(request.cookies.token); //verifie manuellement signature cookie
        if (!result.valid)
            return reply.code(401).send({ error: "Invalid cookie" });
        // console.debug("\nToken dans le user-service : " + result.value + "-");
        request.user = await fastify.jwt.verify(result.value); //Décode et verifie le token et stock ses infos dans request
        // console.debug("Decoded token:", request.user);

        if (request.user.twofa_pending === true)
            return reply.code(401).send({ error: "2FA required" });

		// Refresh token if it's about to expire soon
		const now = Date.now() / 1000;
		const expThreshold = 900; // 15 minutes * 60s
		if (request.user.exp - now < expThreshold) {
			refreshToken(fastify, request.user, reply);
			// console.debug("⚡️⚡️⚡️⚡️⚡️⚡️ Refreshed token ⚡️⚡️⚡️⚡️⚡️⚡️ ");
		} 
		// else {
		// 	console.debug("⚡️⚡️⚡️⚡️⚡️⚡️ Token still valid, no need to refresh ⚡️⚡️⚡️⚡️⚡️⚡️");
		// }
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

fastify.register(dbConnector);

await fastify.register(routes);

// Health check to synchronize initialization of session service
fastify.get("/health", async (request, reply) => {
    console.log("Health check received");
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
