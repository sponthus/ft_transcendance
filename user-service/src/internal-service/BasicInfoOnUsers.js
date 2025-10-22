export async function getBasicInfoOnUsers(request, reply)
{
    const   db = request.server.db;

    try
    {
        const users = db.prepare(   "SELECT \
                                        username, slug, id \
                                    FROM \
                                        users \ ").all();
        return reply.code(200).send({ users: users });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function getIdUserFromSlug(request, reply)
{
    const { slug } = request.params;
    const   db = request.server.db;

	// TODO add input sanitization
    try
    {
        const idUser = db.prepare(  "SELECT \
                                        id \
                                    FROM \
                                        users \
                                    WHERE \
                                        slug = ?").get(slug);
		if (!idUser)
			return reply.code(404).send({ error: "User not found" });
        return reply.code(200).send({ idUser : idUser });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function getUserInfosFromId(request, reply)
{
	const { idUser } = request.params;
	const UserId = parseInt(idUser);

    const   db = request.server.db;
	console.debug("➡️ Getting info for user id ", UserId);

	// TODO add sanitization of idUser
    try
    {
        const userInfo = db.prepare(  "SELECT \
                                        username, slug, nickname \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(UserId);
		if (!userInfo)
			return reply.code(404).send({ error: "User not found" });
        return reply.code(200).send({ userInfo : userInfo });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}