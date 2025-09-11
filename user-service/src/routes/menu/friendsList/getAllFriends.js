export async function   getAllFriends(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const friends = db.prepare("    SELECT \
                                            frie_friend_user_id,  \
                                        FROM \
                                            friends \
                                        WHERE \
                                            frie_user_id = ?").all(idUser);
        return reply.code(200).send({ friends: friends });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}