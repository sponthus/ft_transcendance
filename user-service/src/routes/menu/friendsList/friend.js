import Ajv from "ajv"

export async function   addFriend(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   friendUsername = request.body.username;

    if (checkFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for the friend's username"} );
    try
    {   
        const idFriend = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(friendUsername);
        if (!idFriend)
            return reply.code(400).send({ error: "This user doesn't exist" });
        if (idUser === idFriend.id)
            return reply.code(404).send({ error: "You can't be friend with yourself !" });
        const stmt = db.prepare(" SELECT \
                                        frie_status  \
                                    FROM \
                                        friends \
                                    WHERE \
                                        ((frie_user_id = ? AND frie_friend_user_id = ?) \
                                    OR \
                                        (frie_user_id = ? AND frie_friend_user_id = ?)) \
                                    LIMIT 1");
        const status = stmt.get(idFriend.id, idUser, idUser, idFriend.id);
        if (status)
        {
            if (status.frie_status === 0)
                return reply.code(400).send({ error: "A friend request is already pending" });
            else if (status.frie_status === 1)
                return reply.code(400).send({ error: "You're already friend with this user" });
            //status de refus 
        }
        const statement = db.prepare("  INSERT INTO \
                                            friends (frie_user_id, frie_friend_user_id, frie_status) \
                                        VALUES \
                                            (?, ?, 0)");
        statement.run(idUser, idFriend.id);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "​Internal Servor Error"});
    }
}

export async function   removeFriend(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   friendUsername = request.body.username;

    console.log("REMOVE FRIEND");
    if (checkFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for the friend's username"} );
    try
    {
        const idFriend = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(friendUsername);
        if (!idFriend)
            return reply.code(400).send({ error: "This user doesn't exist" });
        
        const statement = db.prepare("  DELETE FROM \
                                            friends \
                                        WHERE \
                                            ((frie_user_id = ? AND frie_friend_user_id = ?) \
                                        OR \
                                            (frie_user_id = ? AND frie_friend_user_id = ?))");
        statement.run(idUser, idFriend.id, idFriend.id, idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }   
} 

function    checkFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z])[^\\[\\]{}();]+$"},
        },
        required: ["username"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}