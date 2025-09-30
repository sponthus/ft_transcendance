export async function markNotificationsRead(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    console.log("PAR LA PD");
    try
    {
        db.prepare("    UPDATE \
                            notifications \
                        SET \
                            notif_status = 1 \
                        WHERE \
                            notif_user_id = ? \
                        AND \
                            notif_status = 0").run(idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}