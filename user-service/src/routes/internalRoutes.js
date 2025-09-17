import { getBasicInfoOnUsers, getIdUserFromSlug } from "../internal-service/BasicInfoOnUsers.js";

export default async function internalRoutes(fastify)
{
    fastify.get("/internal-service/users-info", { preHandler: [fastify.verifyApiKey] }, getBasicInfoOnUsers);
    fastify.get("/internal-service/slug", { preHandler: [fastify.verifyApiKey] }, getIdUserFromSlug);
}