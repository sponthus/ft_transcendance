import { getBasicInfoOnUsers, getIdUserFromSlug, getUserInfosFromId } from "../internal-service/BasicInfoOnUsers.js";
import { slugSchema } from "../tools/checkFormat.js";

export default async function internalRoutes(fastify)
{
    fastify.get("/internal-service/users-info", { preHandler: [fastify.verifyApiKey] }, getBasicInfoOnUsers);
    fastify.get("/internal-service/:slug", { preHandler: [fastify.verifyApiKey], schema: { params: slugSchema } }, getIdUserFromSlug);
	fastify.get("/internal-service/infos/:idUser", { preHandler: [fastify.verifyApiKey], schema: { params: slugSchema } }, getUserInfosFromId);
}