export default async function   updateNickname (request, reply)
{
    const db = request.server.db;
    const newNickname = request.body.nickname;
    const idUser = request.user.idUser;      
    try
    {
        const existingNickname = db.prepare('   SELECT \
                                                    1 \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    nickname = ?').get(newNickname);
        if (existingNickname)
             return reply.code(409).send({message: "Nickname already exist"});
        db.prepare ("   UPDATE \
                            users \
                        SET \
                            nickname = ? \
                        WHERE \
                            id = ?").run(newNickname, idUser);
        return reply.code(200).send( {nickname: newNickname} )
    }
    catch (err)
    {
        return reply.code(500).send( {message: "Internal Server Error"} );
    }
}