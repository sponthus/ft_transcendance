export default async function updateAvatar (request, reply)
{
    const db = request.server.db;
    const newAvatar = request.body.avatar;
    const idUser = request.body.idUser;
    const slug = request.body.slug;

    try 
    {
        const user = db.prepare("   SELECT \
                                        slug, avatar\
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        if (!user | !user.slug)
            return reply.code(404).send({ message: "User not found" });
        if (user.slug !== slug)
            return reply.code(409).send({ message: "The input slug doesn't match" });
        if (user.avatar === newAvatar)
            return reply.code(200).send();

        db.prepare("    UPDATE \
                            users \
                        SET \
                            avatar = ? \
                        WHERE \
                            id = ?").run(newAvatar, idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}