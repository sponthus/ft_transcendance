import { addTournamentNotif } from "../menu/notifications/tournaments/addTournamentNotif.js";
import { userAnswerTournament } from "../menu/notifications/tournaments/userAnswerTournament.js";
import { addTournamentNotifSchema, answerSchema } from "../tools/checkFormat.js";

export default async function tournamentRoutes(fastify) 
{
	fastify.post("/notifications/tournament/post-notification", { preHandler: [fastify.verifyApiKey], schema : {body: addTournamentNotifSchema} }, addTournamentNotif);
	fastify.post("/notifications/tournament/answer", { preHandler: [fastify.authenticate], schema: {body: answerSchema} }, userAnswerTournament);
}
