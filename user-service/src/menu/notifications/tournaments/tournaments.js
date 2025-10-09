import { addNotification } from "../notificationsManager";

export async function addTournamentNotif (request, reply)
{
    const   db = request.server.db;
    const   { type, receiverId, senderId, tournamentId, tournamentName } = request.server.body;
    try
    {
        const  addNotifTournament = db.transaction( (type, receiverId, senderId, tournamentId, tournamentName) =>
        {
            addNotification(db, receiverId, senderId, type);
            db.prepare( "   UPDATE \
                                notifications \
                            SET \
                                notif_tournament_id = ?, \
                                notif_tournament_name = ? \
                            WHERE \
                                notif_user_id = ?").run(tournamentId, tournamentName, receiverId);
        });
        addNotifTournament(type, receiverId, senderId, tournamentId, tournamentName);
        const result = await notifyRefresh(receiverId, username.username, type);
        if (!result.ok)
            throw new Error(result.error || "Internal Server Error");
        return reply.code(200).send();
    }
    catch (err)
    { 
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}