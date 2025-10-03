
import { createGame, startGame } from "./controllers/GamePostRoutes.js"
import { createTournament } from "./controllers/TournamentPostRoutes.js"
import { getGamesForSlug } from "./controllers/GameGetRoutes.js"
import { deleteGame } from "./controllers/GameDeleteRoutes.js"
import { getTournamentsForSlug, getTournamentMatches, getTournamentNextMatch } from "./controllers/TournamentGetRoutes.js"
import { deleteTournament } from "./controllers/TournamentDeleteRoutes.js"

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
            getRoutes.get(`/:slug/games`,
				{onRequest: [fastify.authenticate]},
                getGamesForSlug);
			getRoutes.get(`/:slug/tournaments`, 
				{onRequest: [fastify.authenticate]},
				getTournamentsForSlug);
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