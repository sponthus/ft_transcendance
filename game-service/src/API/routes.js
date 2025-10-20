
import { createGame, startGame } from "./controllers/GamePostRoutes.js"
import { createTournament } from "./controllers/TournamentPostRoutes.js"
import { acceptTournamentInvitation, declineTournamentInvitation } from "./controllers/TournamentInvitationsRoutes.js"
import { getGamesForSlug } from "./controllers/GameGetRoutes.js"
import { deleteGame } from "./controllers/GameDeleteRoutes.js"
import { getTournamentsForSlug, getTournamentMatches, getTournamentNextMatch } from "./controllers/TournamentGetRoutes.js"
import { deleteTournament } from "./controllers/TournamentDeleteRoutes.js"
import { gameCreationSchema, idSchema, idParamSchema, slugParamsSchema, tournamentActionSchema, tournamentCreationSchema } from "../tools/CheckFormat.js"

// Prefix : /api/games
export default async function routes (fastify, options) {
    console.log(`Registering routes`);

    fastify.register(
        async function (postRoutes) {
            postRoutes.post("/game", 
				{onRequest: [fastify.authenticate], schema: { body: gameCreationSchema }},
                createGame);
            postRoutes.post("/:gameId",
				{onRequest: [fastify.authenticate], schema: { params: idParamSchema }},
                startGame);
            postRoutes.post("/tournament",
                {onRequest: [fastify.authenticate], schema : { body: tournamentCreationSchema }},
                createTournament);
			postRoutes.post("/tournament/accept",
				{onRequest: [fastify.authenticate], schema : { body: tournamentActionSchema }},
				acceptTournamentInvitation);
			postRoutes.post("/tournament/decline",
				{onRequest: [fastify.authenticate], schema : { body: tournamentActionSchema }},
				declineTournamentInvitation);
        }
    );

    fastify.register(
        async function (getRoutes) {
            getRoutes.get(`/:slug/games`,
				{onRequest: [fastify.authenticate], schema: { params: slugParamsSchema }},
                getGamesForSlug);
			getRoutes.get(`/:slug/tournaments`, 
				{onRequest: [fastify.authenticate], schema: { params: slugParamsSchema }},
				getTournamentsForSlug);
			getRoutes.get(`/:tournamentId`,
				{onRequest: [fastify.authenticate], schema: { params: idSchema }},
				getTournamentMatches);
			getRoutes.get(`/:tournamentId/next-match`, 
				{onRequest: [fastify.authenticate], schema: { params: idSchema }},
				getTournamentNextMatch);
        }
    );

    fastify.register(
        async function (deleteRoutes) {
            deleteRoutes.delete("/:gameId",
				{onRequest: [fastify.authenticate], schema: { params: idSchema }},
                deleteGame);
			deleteRoutes.delete("/tournament/:tournamentId",
				{onRequest: [fastify.authenticate], schema: { params: idSchema }},
				deleteTournament);
			}
    );
}