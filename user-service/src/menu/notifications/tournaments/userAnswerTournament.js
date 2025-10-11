import env from "../../../config/env.js";
import { getSecret } from "../../../index.js";
import prefix from "../../../tools/url.js";
import tlsAgent from "../../../tools/tlsAgent.js";

export async function   userAnswerTournament(request, reply)
{
    const db = request.server.db;
    const idUser = request.user.idUser;
    const { ownerSlug, tournamentName, answer } = request.body;

    const ownerId = db.prepare("    SELECT \
                                        id \
                                    FROM \
                                        users \
                                    WHERE \
                                        slug = ?").get(ownerSlug);

    const tournamentId = db.prepare("   SELECT \
                                            notif_tounament_id \
                                        FROM \
                                            notifications \
                                        WHERE \
                                            notif_tournament_name = ?").get(tournamentName);
    db.prepare(     "DELETE FROM \
                        notifications \
                    WHERE \
                        notif_user_id = ? \
                    AND \
                        notif_sender_id = ? \
                    AND \
                        notif_tournament_id = ? \
                    AND \
                        notif_type = 'tournament_invite'").run(idUser, ownerId, tournamentId);
    let url;
    if (answer === "decline")
        url = `${prefix}://session-service:${env.session_port}/tournament/decline`
    else
        url = `${prefix}://session-service:${env.session_port}/tournament/accept`
    answerTournament(userId, ownerId, tournamentId, tournamentName, url);
}

export async function answerTournament(userId, ownerId, tournamentId, tournamentName) 
{
    const api_key = getSecret('api_key');

    const res = await fetch(url, 
    {
        method: 'POST',
        headers: 
        { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
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