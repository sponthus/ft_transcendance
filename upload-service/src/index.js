import Fastify from "fastify";
import multipart from "@fastify/multipart"; // Allows multipart API requests (ie : images)
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from "@fastify/cookie";
import { fileURLToPath } from "url"; // Transforms ESM paths to system paths
import path from 'path'; // utilities for working with file and directory paths
import env from "../config/env.js";
import fs from "fs";
import logger from "../config/logger.js";
import routes from "./routes.js";

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

fastify.register(fastifyCookie,
{
	secret: getSecret('cookie_key')
});

await fastify.register(multipart);
console.log(`multipart loaded`);

console.log('Parameters for app are being set'); // debug

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
        const result = fastify.unsignCookie(request.cookies.token);
        if (!result.valid)
            return reply.code(401).send({ error: "Invalid cookie" });
        request.user = await fastify.jwt.verify(result.value);
        if (request.user.twofa_pending === true)
            return reply.code(401).send({ error: "2FA required" });
		console.debug('DECODED TOKEN ', request.user);
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

export function getSecret(name) {
	try {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	} catch (error) {
		console.log("❌ Critical error : Unable to read secret ", name);
		process.exit(1);
	}
}

//enregistre le plugin JWT dans fastify
fastify.register(fastifyJwt, {
	secret: getSecret('hash_key'),
});

// TODO implement routes
await fastify.register(routes);

fastify.get('/', async (req, reply) => {
	console.log("Msg recieved on /");
    return { message: 'Upload service received your request!' };
});

// Default handler for undefined routes
fastify.setNotFoundHandler((req, reply) => {
    reply.status(404).send("Not found");
});

fastify.get("/health", async (request, reply) => {
    return { status: "ok" };
});

// Fastify listens
fastify.listen({ port: env.upload_port, host: `${env.ip}` }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server running in ${env.nodeEnv} mode at ${address}`);
});