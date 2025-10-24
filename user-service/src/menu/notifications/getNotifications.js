export async function   getAllNotifications(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const   notifs = db.prepare("   SELECT \
                                            users.slug, \
                                            notifications.notif_type, \
                                            notifications.notif_status, \
                                            notifications.notif_tournament_id, \
                                            notifications.notif_tournament_name, \
                                            notifications.created_at \
                                        FROM \
                                            notifications \
                                        JOIN \
                                            users \
                                        ON \
                                            notifications.notif_sender_id = users.id \
                                        WHERE \
                                            notifications.notif_user_id = ? \
                                        ORDER BY \
                                            notifications.created_at DESC").all(idUser);
        return reply.code(200).send({ notifs: notifs });
    }
    catch (err)
    { 
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function   getAllSpecificNotifications(request, reply, status) //read or unread
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const   notifs = db.prepare("   SELECT \
                                            users.slug, \
                                            notifications.notif_type, \
                                            notifications.notif_status, \
                                            notifications.notif_tournament_id, \
                                            notifications.notif_tournament_name, \
                                            notifications.created_at \
                                        FROM \
                                            notifications \
                                        JOIN \
                                            users \
                                        ON \
                                            notifications.notif_sender_id = users.id \
                                        WHERE \
                                            notifications.notif_user_id = ? \
                                        AND \
                                            notifications.notif_status = ? \
                                        ORDER BY \
                                            notifications.created_at DESC").all(idUser, status);
        return reply.code(200).send({ notifs: notifs });
    }
    catch (err)
    { 
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function  countUnreadNotifications(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const row = db.prepare("    SELECT COUNT(*) AS \
                                        unread_count \
                                    FROM \
                                        notifications \
                                    WHERE \
                                        notif_user_id = ? \
                                    AND \
                                        notif_status = 0").get(idUser);
        return reply.code(200).send({ count: row.unread_count });
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" + err.message});
    }
}