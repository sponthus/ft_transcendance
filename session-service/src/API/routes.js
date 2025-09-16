import { getStatusForSlug } from "./StatusGetRoutes.js"

export default async function routes (fastify, options) {
	console.log(`Registering routes`);

	// fastify.register(
	// 	async function (postRoutes) {
	// 		postRoutes.post("/message/:userId",
	// 			{onRequest: [fastify.int_authenticate]},
	// 			sendMessageToUser);
	// 	}
	// );

	fastify.register(
		async function (getRoutes) {
			getRoutes.get(`/:slug`,
				{onRequest: [fastify.authenticate]},
				getStatusForSlug);
		}
	);

	// fastify.register(
	// 	async function (deleteRoutes) {
	// 		deleteRoutes.delete("/:gameId",
	// 			{onRequest: [fastify.authenticate]},
	// 			deleteGame);

	// 		}
	// );
}