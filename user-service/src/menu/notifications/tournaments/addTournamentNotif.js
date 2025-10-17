import { notifyRefresh } from "../../../internal-service/notifyServices.js";

export async function addTournamentNotif (request, reply)
{
    const   db = request.server.db;
    const   { type, receiverId, senderId, tournamentId, tournamentName } = request.body;
   
	// TODO Unknown type = error 500
	// TODO missing field = error 500
	// TODO : Bad type (string) for reciever / sender ids = error 500
	// TODO accepts tournamentId as a string, should not
    console.debug('request.body :', request.body);
    try
    {
        let receiverIds;
        if (Array.isArray(receiverId))
            receiverIds = receiverId;
        else
            receiverIds = [receiverId];
        const  addNotifTournament = db.transaction( (type, receiverIds, senderId, tournamentId, tournamentName) =>
        {
            for (const id of receiverIds)
            {
                if (type === 'tournament_ready' || type === 'tournament_cancel')
                    clearNotif(db, id, tournamentId);
                addNotif(db, id, senderId, type, tournamentId, tournamentName);
            }
        });
        console.debug(type)
        addNotifTournament(type, receiverIds, senderId, tournamentId, tournamentName);
		notifyRefresh(receiverIds, tournamentId, type);
        return reply.code(200).send();
    }
    catch (err)
    { 
        return reply.code(500).send({ error: "Internal Server Error" + err.message });
    }
}

function clearNotif(db, receiverId, tournamentId)
{
    db.prepare( "   DELETE FROM \
                        notifications \
                    WHERE \
                        notif_user_id = ? \
                    AND \
                        notif_tournament_id = ? \
                    AND \
                        notif_type IN('tournament_invite', 'tournament_accept')").run(receiverId, tournamentId);
}

function addNotif(db, receiverId, senderId, type, tournamentId, tournamentName)
{
    const countRow = db.prepare("   SELECT COUNT(*) AS \
                                        notif_count \
                                    FROM \
                                        notifications \
                                    WHERE \
                                        notif_user_id = ?").get(receiverId);
    if (countRow.notif_count > 20)
    {
        db.prepare("    DELETE FROM \
                           notifications \
                        WHERE \
                            notif_id IN \
                            ( \
                                SELECT \
                                    notif_id \
                                FROM \
                                    notifications \
                                WHERE \
                                    notif_user_id = ? \
                                ORDER BY \
                                    created_at ASC \
                                LIMIT 1 \
                           )").run(receiverId);
    }
    db.prepare("    INSERT INTO \
                        notifications (notif_user_id, notif_sender_id, notif_type, notif_tournament_id, notif_tournament_name) \
                    VALUES \
                        (?, ?, ?, ?, ?)").run(receiverId, senderId, type, tournamentId, tournamentName);
}