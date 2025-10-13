import env from "../../../../config/env.js";
import { getSecret } from "../../../index.js";
import prefix from "../../../tools/url.js";
import tlsAgent from "../../../tools/tlsAgent.js";

export async function   userAnswerTournament(request, reply)
{
    const db = request.server.db;
    const idUser = request.user.idUser;
    const { ownerSlug, tournamentName, answer } = request.body;

    try
    {   
        const ownerId = db.prepare("    SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            slug = ?").get(ownerSlug);
        if (!ownerId || !ownerId.id)
            return reply.code(404).send({ error: "Resource not found ICI " });

        const tournamentId = db.prepare("   SELECT \
                                                notif_tournament_id \
                                            FROM \
                                                notifications \
                                            WHERE \
                                                notif_tournament_name = ?").get(tournamentName); //PROETGER AUSSI POUR LE TOURNAMENT ID

        if (!tournamentId || !tournamentId.notif_tournament_id)
            return reply.code(404).send({ error: "Resource not found ID TOUANMENT" });

        console.log('\ntournamentId : ', tournamentId);
        console.log('\nownerId : ', ownerId);
        console.log('\nidUser : ', idUser);
        db.prepare(     "DELETE FROM \
                            notifications \
                        WHERE \
                            notif_user_id = ? \
                        AND \
                          notif_sender_id = ? \
                        AND \
                            notif_tournament_id = ? \
                        AND \
                            notif_type = 'tournament_invite'").run(idUser, ownerId.id, tournamentId.notif_tournament_id);
        let url;
        if (answer === "decline")
        {;
            url = `${prefix}://game-service:${env.game_port}/tournament/decline`;
            //url = `http://session-service:3004/tournament/decline`;
        }
        else
        {
            url = `${prefix}://game-service:${env.game_port}/tournament/accept`;
            //url = `http://session-service:3004/tournament/accept`;
        }
        const req = await answerTournament(idUser, ownerId.id, tournamentId.notif_tournament_id, tournamentName, url);
		if (req.ok)
		{
			return reply.code(200).send();
		}
		else
		{
			console.error("Error answering tournament:", req.error);
		}
    }
    catch(err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function answerTournament(userId, ownerId, tournamentId, tournamentName, url) 
{
    const api_key = getSecret('api_key');


    console.log('info avant le FECTH: ', userId, ownerId, tournamentId, tournamentName, url);
    const res = await fetch(url, 
    {
        method: 'POST',
        headers: 
        { 
            'x-internal-api-key': api_key,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(
        { 
            userId: userId,
            ownerId: ownerId,
            tournamentId: tournamentId,
            tournamentName: tournamentName
        }),
		dispatcher: tlsAgent
	});
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}