export async function   getAllFriends(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
       const friends = db.prepare("    SELECT \
                                            users.username, users.slug, users.avatar \
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
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function   getAllFriendsBySlug(request, reply)
{
    const   db = request.server.db;
    const   slug = request.params.slug;

    try
    {
        const user = db.prepare("   SELECT \
                                        id \
                                    FROM \
                                        users \
                                    WHERE \
                                        slug = ?").get(slug);
        if (!user || !user.id)
            return reply.code(404).send({ message: "Resource not found" });
        const friends = db.prepare("    SELECT \
                                            users.username, users.slug, users.avatar \
                                        FROM \
                                            friends \
                                        INNER JOIN \
                                            users \
                                        ON \
                                            friends.frie_friend_user_id = users.id \
                                        WHERE \
                                            friends.frie_status = 1 \
                                        AND \
                                            friends.frie_user_id = ?").all(user.id);
        return reply.code(200).send({ friends: friends });
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}