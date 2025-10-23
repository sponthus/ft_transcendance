import { send } from "process";
import { notifyRefresh } from "../../../internal-service/notifyServices.js";

export async function addTournamentNotif (request, reply)
{
    const   db = request.server.db;
    const   { type, receiverId, senderId, tournamentId, tournamentName } = request.body;
  
    try
    {
        if (checkUsersExist(db, receiverId, senderId) === false)
            return reply.code(404).send({ error: "Some users you’re trying to notify were not found" });

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
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

function checkUsersExist(db, receiverId, senderId)
{
        let allIds = [];
        if (Array.isArray(receiverId))
            allIds = [...receiverId];
        else
            allIds = [receiverId];
        allIds.push(senderId);
        allIds = [...new Set(allIds)]; //delete duplicate if senderId is in ReceiverId
        const placeholders = allIds.map(() => '?').join(', ');

        const row = db.prepare(`
            SELECT COUNT(id) AS found_count
            FROM users
            WHERE id IN (${placeholders})
            `).get(...allIds);
        if (row.found_count !== allIds.length)
            return (false);
        return (true)
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