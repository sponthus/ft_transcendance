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
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function   getUserInfoByUsername (request, reply)
{
	const   db = request.server.db;
    const   username= request.params.username;

    console.log("PARRRRRR LLAAAAA\n");
    try
    {
       const user = db.prepare("   SELECT \
                                        username, nickname, avatar, slug, created_at \
                                    FROM \
                                        users \
                                    WHERE \
                                        username = ?").get(username);
       return reply.code(200).send({ userInfo: user }) 
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}