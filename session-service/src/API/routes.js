import { changeInfosSchema, idParamSchema, sendMessageToGroupSchema, slugParamsSchema } from "../tools/CheckFormat.js";
import { getStatusForSlug } from "./StatusGetRoutes.js"
import { changeUserInfos } from "./StatusPatchRoutes.js"
import { sendMessageToUsers } from "./StatusPostRoutes.js"; 

export default async function routes (fastify, options) {
	console.log(`Registering routes`);

	fastify.register(
		async function (postRoutes) {
			postRoutes.post("/message", 
				{onRequest: [fastify.int_authenticate], schema: { body: sendMessageToGroupSchema }},
				sendMessageToUsers);
		}
	);

	fastify.register(
		async function (getRoutes) {
			getRoutes.get(`/:slug`,
				{onRequest: [fastify.int_authenticate], schema: { params: slugParamsSchema }},
				getStatusForSlug);
		}
	);

	fastify.register(
		async function (patchRoutes) {
			patchRoutes.patch(`/data/:userId`,
				{onRequest: [fastify.int_authenticate], schema: { params: idParamSchema, body: changeInfosSchema}},
				changeUserInfos);
		}
	);
}