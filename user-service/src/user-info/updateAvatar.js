export default async function updateAvatar (request, reply)
{
    const db = request.server.db;
    const newAvatar = request.body.avatar;
    const idUser = request.user.idUser;
    const slug = request.params.slug;

    //met en lowercase et verifie l'extension
    if (!newAvatar.toLowerCase().endsWith('.jpg'))
        return reply.code(400).send( {error : "Invalid avatar format : only .jpg avatars"} );
    try 
    {
        const currentAvatar = db.prepare("  SELECT \
                                                avatar \
                                            FROM \
                                                users \
                                            WHERE \
                                                id = ?").get(idUser);
        if (currentAvatar === newAvatar)
            return reply.code(400).send( {error: "Avatar is already set to this value"} );

        db.prepare("    UPDATE \
                            users \
                        SET \
                            avatar = ? \
                        WHERE \
                            id = ?").run(newAvatar, idUser);
        return reply.code(200).send( { avatar: avatar } );
    }
    catch (err)
    {
        return reply.code(500).send( {error : "Internal Server Error"} );
    }
}