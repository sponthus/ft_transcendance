export async function   getUserInfo (request, reply)
{
	const   db = request.server.db;
    const   idUser = request.user.idUser;
    try
    {
       const user = db.prepare("   SELECT \
                                        id, username, nickname, avatar, slug, created_at \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
       return reply.code(200).send({ userInfo: user }) 
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}

export async function   getUserInfoBySlug (request, reply)
{
	const   db = request.server.db;
    const   slug = request.params.slug;
    const   idUser = request.user.idUser;

    try
    {
       const user = db.prepare("   SELECT \
                                        users.username, \
                                        users.nickname, \
                                        users.avatar, \
                                        users.slug, \
                                        users.created_at, \
                                        CASE \
                                            WHEN f.frie_status = 1 THEN 'friends' \
                                            WHEN f.frie_user_id = ? AND f.frie_status = 0 THEN 'request_sent' \
                                            WHEN f.frie_friend_user_id = ? AND f.frie_status = 0 THEN 'request_received' \
                                            ELSE 'none' \
                                        END AS friendship_status \
                                    FROM \
                                        users \
                                    LEFT JOIN friends f \
                                        ON ( (f.frie_user_id = ? AND f.frie_friend_user_id = users.id) \
                                        OR (f.frie_user_id = users.id AND f.frie_friend_user_id = ?) )\
                                    WHERE \
                                        slug = ?").get(idUser, idUser, idUser, idUser, slug);
		if (!user)
			return reply.code(404).send({ message: "User not found" });
		return reply.code(200).send({ userInfo: user }) 
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" + err.message});
    }
}