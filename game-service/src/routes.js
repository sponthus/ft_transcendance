
import { createGame, startGame } from "./API/controllers/GamePostRoutes.js"
import { createTournament } from "./API/controllers/TournamentPostRoutes.js"
import { getGamesForUserId } from "./API/controllers/GameGetRoutes.js"
import { deleteGame } from "./API/controllers/GameDeleteRoutes.js"
import { getTournamentsForUserId, getTournamentMatches, getTournamentNextMatch } from "./API/controllers/TournamentGetRoutes.js"
import { deleteTournament } from "./API/controllers/TournamentDeleteRoutes.js"

export default async function routes (fastify, options) {
    console.log(`Registering routes`);

    fastify.register(
        async function (postRoutes) {
            postRoutes.post("/game", 
				{onRequest: [fastify.authenticate]},
                createGame);
            postRoutes.post("/:gameId",
				{onRequest: [fastify.authenticate]},
                startGame);
            postRoutes.post("/tournament",
                {onRequest: [fastify.authenticate]},
                createTournament);
        }
    );

    fastify.register(
        async function (getRoutes) {
            getRoutes.get(`/:userId/games`,
				{onRequest: [fastify.authenticate]},
                getGamesForUserId);
			getRoutes.get(`/:userId/tournaments`, 
				{onRequest: [fastify.authenticate]},
				getTournamentsForUserId);
			getRoutes.get(`/:tournamentId`,
				{onRequest: [fastify.authenticate]},
				getTournamentMatches);
			getRoutes.get(`/:tournamentId/next-match`, 
				{onRequest: [fastify.authenticate]},
				getTournamentNextMatch);
        }
    );

    fastify.register(
        async function (deleteRoutes) {
            deleteRoutes.delete("/:gameId",
				{onRequest: [fastify.authenticate]},
                deleteGame);
			deleteRoutes.delete("/tournament/:tournamentId",
				{onRequest: [fastify.authenticate]},
				deleteTournament);
			}
    );
}