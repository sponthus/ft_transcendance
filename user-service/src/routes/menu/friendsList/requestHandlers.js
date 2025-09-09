import { checkFormat } from "../../tools/checkFormat.js";

export async function   acceptRequest(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   senderUsername = request.body.username;
    
    //if (checkFormat(request) == false)
      //  return reply.code(400).send( {error : "Invalid format for the friend's username"} );

    try
    {
        const idSender = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(senderUsername);

        //check request exist
        const stmt = db.prepare( "  SELECT \
                                        frie_status \
                                    FROM \
                                        friends \
                                    WHERE \
                                        (frie_user_id = ? AND frie_friend_user_id = ?)");
        const existingRequest = stmt.get(idSender.id, idUser);
        if (!existingRequest)
            return reply.code(404).send({ error: "There is no pending request from " + senderUsername });
        if (existingRequest.frie_status === 1)
        {
            //est-ce que je verifie que 2 lignes sont bien presente sinon je cree l'autre?
            return reply.code(409).send({ error: "You're already friend with " + senderUsername });
        }
                                            
        db.prepare("    INSERT INTO \
                            friends (frie_user_id, frie_friend_user_id, frie_status) \
                        VALUES \
                            (?, ?, 1)").run(idUser, idSender.id);
        db.prepare("    UPDATE \
                            friends \
                        SET \
                            frie_status = 1 \
                        WHERE \
                            (frie_user_id = ? AND frie_friend_user_id = ?)").run(idSender.id, idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}
