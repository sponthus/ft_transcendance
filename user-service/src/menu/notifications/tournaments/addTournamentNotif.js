export async function addTournamentNotif (request, reply)
{
    console.log("TOURNAMENNNTTT BOTIF ICI");
    const   db = request.server.db;
    const   { type, receiverId, senderId, tournamentId, tournamentName } = request.body;
   
    console.log('request.body :', request.body);
    console.log('request.body type :', typeof request.body);
    try
    {
        let receiverIds;
        if (Array.isArray(receiverId))
            receiverIds = receiverId; //si deja tableau on fait rien
        else
            receiverIds = [receiverId]; // sinon met dans un tableau
        const  addNotifTournament = db.transaction( (type, receiverIds, senderId, tournamentId, tournamentName) =>
        {
            for (const id of receiverIds)
            {
                // if type === ready || cancel
                //fonction qui check les notifications --> si ready ou annuler enlever les notifs
                addNotif(db, id, senderId, type, tournamentId, tournamentName);
            }
        });
        addNotifTournament(type, receiverIds, senderId, tournamentId, tournamentName);
        await Promise.all(receiverIds.map(async (id) => //.map parcout chaque id
            {
                const result = await notifyRefresh(id, username.username, type);
                if (!result.ok)
                    {
                        console.log("erreur notifiy refresh");
                        throw new Error(result.error || "Internal Server Error");
                    }
            })); 
        return reply.code(200).send();
    }
    catch (err)
    { 
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

function addNotif(db, receiverId, senderId, type, tournamentId, tournamentName)
{
    console.log('\nreceiverId = ', receiverId);
    console.log('\nsenderId = ', senderId);
    console.log('\ntype = ', type);
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
                        notifications (notif_user_id, notif_sender_id, notif_type) \
                    VALUES \
                        (?, ?, ?)").run(receiverId, senderId, type);
    db.prepare( "   UPDATE \
                        notifications \
                    SET \
                        notif_tournament_id = ?, \
                        notif_tournament_name = ? \
                    WHERE \
                        notif_user_id = ?").run(tournamentId, tournamentName, receiverId);
}