export default async function getBasicInfoOnUsers(request, reply)
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