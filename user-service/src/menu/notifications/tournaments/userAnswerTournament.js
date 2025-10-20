import env from "../../../../config/env.js";
// import { getSecret } from "../../../index.js";
import prefix from "../../../tools/url.js";
// import tlsAgent from "../../../tools/tlsAgent.js";
// import { checkAnswerFormat } from "../../../tools/checkFormat.js";
import { answerTournament } from "../../../internal-service/notifyServices.js";

export async function   userAnswerTournament(request, reply)
{
    const db = request.server.db;
    const idUser = request.user.idUser;
    const { ownerSlug, tournamentId, tournamentName, answer } = request.body;

    try
    {   
        const ownerId = db.prepare("    SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            slug = ?").get(ownerSlug);
        if (!ownerId || !ownerId.id)
            return reply.code(404).send({ message: "Resource not found" });

        db.prepare(     "DELETE FROM \
                            notifications \
                        WHERE \
                            notif_user_id = ? \
                        AND \
                          notif_sender_id = ? \
                        AND \
                            notif_tournament_id = ? \
                        AND \
                            notif_type = 'tournament_invite'").run(idUser, ownerId.id, tournamentId);
        let url;
        if (answer === "decline")
        {
            console.log("decline invitation")
            url = `${prefix}://game-service:${env.game_port}/tournament/decline`;
        }
        else
        {
            console.log("accept invitation")
            url = `${prefix}://game-service:${env.game_port}/tournament/accept`;
        }
        const req = await answerTournament(idUser, ownerId.id, tournamentId, tournamentName, url);
		if (req.ok)
		{
			return reply.code(200).send(); // TODO METTRE EN HAUT 
		}
        return reply.code(req.status).send({ message: req.error });
    }
    catch(err)
    {
        return reply.code(500).send({ message: "Internal Server Error"});
    }
}