import { addTournamentNotif } from "../menu/notifications/tournaments/addTournamentNotif.js";
import { userAnswerTournament } from "../menu/notifications/tournaments/userAnswerTournament.js";

export default async function tournamentRoutes(fastify) 
{
	fastify.post("/notifications/tournament/post-notification", { preHandler: [fastify.verifyApiKey] }, addTournamentNotif);
	fastify.get("/notifications/tournament/answer", { preHandler: [fastify.authenticate] }, userAnswerTournament);
}
