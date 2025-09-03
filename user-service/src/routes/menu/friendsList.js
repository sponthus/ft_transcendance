export async function   addFriend(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   friendUsername = request.body.username;

    //key  user   friend
    //1    1     2
    //2    1     3

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
        if (idUser === idFriend.id)
            return reply.code(404).send({ error: "You can't be friend with yourself !" });
        const stmt = db.prepare(" SELECT \
                                        frie_user_id  \
                                    FROM \
                                        friends \
                                    WHERE \
                                        ((frie_user_id = ? AND frie_friend_user_id = ?) \
                                    OR \
                                        (frie_user_id = ? AND frie_friend_user_id = ?)) \
                                    LIMIT 1");
        const status = statement.get(idFriend, idUser, idUser, idFriend);
        if (status)
        {
            if (status === 0)
                return reply.code(400).send({ error: "A friend resquest is already pending" });
            else if (status === 1)
                return reply.code(400).send({ error: "You're already friend with this user" });
            //status de refus 
        }
            
        //faire un check que l'utilisateur existe aussi dans la base donnée ?
        const statement = db.prepare("  INSERT INTO \
                                            friends (frie_user_id, frie_friend_user_id, frie_status) \
                                        VALUES \
                                            (?, ?, 0)");
        statement.run(idUser, idFriend.id);
        return reply.code(200).send({ friend: idFriend }); //idFriend a enlever pas safe
    }
    catch (err)
    {
        return reply.code(500).send({ error: "❌​ Internal Servor Error" + err.message});
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
                                            frie_user_id = ?").all(idUser);
        return reply.code(200).send({ friends: friends });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "❌​ Internal Server Error" });
    }
}