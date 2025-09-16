export async function   getAllFriends(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
       const friends = db.prepare("    SELECT \
                                            users.username  \
                                        FROM \
                                            friends \
                                        INNER JOIN \
                                            users \
                                        ON \
                                            friends.frie_friend_user_id = users.id \
                                        WHERE \
                                            friends.frie_status = 1 \
                                        AND \
                                            friends.frie_user_id = ?").all(idUser);
        return reply.code(200).send({ friends: friends });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}