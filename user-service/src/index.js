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
import Ajv from "ajv";
import ajvErrors from "ajv-errors";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename); 

let fastify;

const ajv = new Ajv({ allErrors: true, removeAdditional: false });
ajvErrors(ajv);

if (env.nodeEnv === 'production') {
	// With cert in volumes
	// try {
	// 	fs.accessSync(`/etc/ssl/${env.domain_name}.key`, fs.constants.R_OK);
	// 	fs.accessSync(`/etc/ssl/${env.domain_name}.crt`, fs.constants.R_OK);
	// 	console.log("SSL certificates found and accessible");
	// } catch (err) {
	// 	console.error(err);
	// 	console.error("❌ Critical message: SSL certificates not found or inaccessible");
	// 	process.exit(1);
	// }

	// fastify = Fastify({
	// 	logger: logger,
	// 	https: {
	// 		key: fs.readFileSync(`/etc/ssl/${env.domain_name}.key`),
	// 		cert: fs.readFileSync(`/etc/ssl/${env.domain_name}.crt`)
	// 	},
    //     ajv:
    //     {
    //         customOptions:
    //         {
    //             coerceTypes: false,
    //             removeAdditional: false,
    //             allErrors: true,
    //         },
    //         plugins: [ajvErrors],
    //     },
    //     schemaErrorFormatter: (errors, dataVar) => 
    //     {
    //         const firstError = errors[0];
    //         const errorSchema =  { message: firstError.message };
    //         const err = new Error(errorSchema.message);
    //         err.validation = errorSchema;
    //         err.validationContext = dataVar;
    //         err.statusCode = 400;
    //         return err;
    //     }
	// });

		fastify = Fastify({
		logger: logger,
		https: {
			key: getSecret('ssl_key.key'),
			cert: getSecret('ssl_cert.crt')
		},
        ajv:
        {
            customOptions:
            {
                coerceTypes: false,
                removeAdditional: false,
                allErrors: true,
            },
            plugins: [ajvErrors],
        },
        schemaErrorFormatter: (errors, dataVar) => 
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
	console.log("App launched in production mode");
}
else
{
	fastify = Fastify(
    {
		logger: false,
        ajv:
        {
            customOptions:
            {
                coerceTypes: false,
                removeAdditional: false,
                allErrors: true,
            },
            plugins: [ajvErrors],
        },
        schemaErrorFormatter: (errors, dataVar) =>
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

console.log(`\nFastify user-service listen on port ${env.user_port}\n`);

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
		console.log("❌ Critical message: Unable to read secret ", name);
		process.exit(1);
	}
}

fastify.decorate("verifyApiKey", async function (request, reply)
{
    console.log('Check API key');
    const   apiKey = request.headers['x-internal-api-key'];
    if (!apiKey || apiKey !== getSecret('api_key'))
		return reply.code(401).send({ message: 'Unauthorized: Invalid API Key' });
});

fastify.decorate("authenticate_2fa", async function (request, reply)
{
    try 
    {
        const result = fastify.unsignCookie(request.cookies.token); 
        if (!result.valid)
            return reply.code(401).send({ message: "Invalid cookie" });
        request.user = await fastify.jwt.verify(result.value);
		// console.debug('authenticate 2fa DECODED TOKEN ', request.user);
        if (request.user.twofa_pending === false)
            return reply.code(401).send({ message: "only tmp token" });
    } 
    catch (err)
    {
        return reply.code(401).send({message: err.message});
    }
});

fastify.decorate("authenticate", async function (request, reply)
{
    try 
    {
        if (!request.cookies || !request.cookies.token)
			return reply.code(401).send({ message: "Invalid cookie" });
        const result = fastify.unsignCookie(request.cookies.token); //verifie manuellement signature cookie
        if (!result.valid)
            return reply.code(401).send({ message: "Invalid cookie" });
        request.user = await fastify.jwt.verify(result.value); //Décode et verifie le token et stock ses infos dans request
		// console.debug('authenticate DECODED TOKEN ', request.user);
        if (request.user.twofa_pending === true)
            return reply.code(401).send({ message: "2FA required" });

		// Refresh token if it's about to expire soon
		const now = Date.now() / 1000;
		const expThreshold = 900; // 15 minutes * 60s
		if (request.user.exp - now < expThreshold) {
			refreshToken(fastify, request.user, reply);
		} 
	}
	catch (err)
	{
	    return reply.code(401).send({message: err.message});
    }
    try
    {
        const db = request.server.db;
        const idUser = request.user.idUser;
        const userExists = db.prepare(" SELECT \
                                            1 \
                                        FROM \
                                            users \
                                        WHERE \
                                            id = ? AND slug = ? AND username = ?").get(idUser, request.user.slug, request.user.username);
        if (!userExists)
            return reply.code(404).send({ message: "User not found" });

    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
});


fastify.setErrorHandler((error, request, reply) => {
    console.error("error:", error.message);
    if (error.message === 'Invalid state')
        return reply.code(403).send({ message: error.message})
    reply.status(error.statusCode || 500).send({
        message: error.message || "Internal Server Error"
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
    console.log("Error 404", {
        url: req.url,
        method: req.method,
        headers: req.headers
    });
    reply.status(404).send("Not found");
});

fastify.listen({ port: env.user_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});
