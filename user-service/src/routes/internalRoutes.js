import getBasicInfoOnUsers from "../internal-service/getBasicInfoOnUsers.js";

export default async function internalRoutes(fastify)
{
    fastify.get("/internal-service/users-info", { preHandler: [fastify.verifyApiKey] }, getBasicInfoOnUsers);
}