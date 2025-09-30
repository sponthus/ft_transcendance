export default async function loginThroughToken(request, reply)
{
        console.log("Login through token");
        const db = request.server.db;
        const idUser = request.user.idUser;
        try 
        {
                const userData = db.prepare("   SELECT \
                                                        * \
                                                FROM \
                                                        users \
                                                WHERE \
                                                        id = ?").get(idUser);
                if (!userData)
                        return reply.code(404).send({ error: "User not found" });
                return reply.code(200).send({ username: userData.username, slug: userData.slug });
        }
        catch (err)
        {
                return reply.code(500).send({error : "Internal Server Error"});
        }
}