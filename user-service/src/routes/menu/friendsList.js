export async function   addFriend(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   friendUsername = request.body.username;

    try
    {
       
        const idFriend = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(friendUsername);
        if (!idFriend.id)
            return reply.code(400).send({ error: "This user doesn't exist" });

        //check les doublons
         //faire un check si already friend dans la ta table friend PAS COMME EN DESSOUS
         //faire un check que l'utilisateur existe aussi dans la base donnée ?
        /*const alreadyFriend = db.prepare("  SELECT \
                                                1 \
                                            FROM \
                                                friends \")*/

        const statement = db.prepare("  INSERT INTO \
                                            friends (frie_user_id, frie_friend_user_id, frie_status) \
                                        VALUES \
                                            (?, ?, 0)");
        statement.run(idUser, idFriend.id);
        return reply.code(200).send({ friend: idFriend }); //idFriend a enlever pas safe
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Servor Error" + err.message});
    }
}

export async function   getAllFriends(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const friends = db.prepare("    SELECT \
                                            frie_friend_user_id \
                                        FROM \
                                            friends \
                                        WHERE \
                                            frie_user_id = ?").get(idUser);
        //return
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}