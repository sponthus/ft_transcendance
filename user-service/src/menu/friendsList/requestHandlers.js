import { checkUsernameFormat } from "../../tools/checkFormat.js";
import { addNotification, deleteNotification } from "../notifications/notificationsManager.js";

export async function   acceptRequest(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   senderUsername = request.body.username;
    
    if (checkUsernameFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for the friend's username"} );

    try
    {
        const idSender = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(senderUsername);
        if (!idSender)
            return reply.code(404).send({ error: "This user doesn't exist" });
        if (idUser === idSender.id)
            return reply.code(409).send({ error: "You can't be friend with yourself !" });
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
            return reply.code(409).send({ error: "You're already friend with " + senderUsername });
        addNotification(db, idSender.id, idUser, "friend_accept");
        deleteNotification(db, idUser, idSender.id, "friend_request");
        const acceptFriendship = db.transaction( (idUser, idSender) =>
        {
            db.prepare("    INSERT INTO \
                                friends (frie_user_id, frie_friend_user_id, frie_status) \
                            VALUES \
                                (?, ?, 1)").run(idUser, idSender);
            db.prepare("    UPDATE \
                                friends \
                            SET \
                                frie_status = 1 \
                            WHERE \
                                (frie_user_id = ? AND frie_friend_user_id = ?)").run(idSender, idUser);

        });
        acceptFriendship(idUser, idSender.id);                              
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" + err.message});
    }
}

export async function   rejectRequest(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   senderUsername = request.body.username;

    if (checkUsernameFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for the friend's username"} );

    try
    {
        const idSender = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(senderUsername);
        if (!idSender)
            return reply.code(404).send({ error: "This user doesn't exist" });
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
            return reply.code(409).send({ error: "You're already friend with " + senderUsername });

        deleteNotification(db, idUser, idSender.id, "friend_request");
        addNotification(db, idSender.id, idUser, "friend_reject");
        db.prepare("    DELETE FROM \
                            friends \
                        WHERE \
                            (frie_user_id = ? AND frie_friend_user_id = ?)").run(idSender.id, idUser);
        return reply.code(200).send();    
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error"});
    }
}

export async function   getSentRequests(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
       const requests = db.prepare("    SELECT \
                                            users.slug  \
                                        FROM \
                                            friends \
                                        INNER JOIN \
                                            users \
                                        ON \
                                            friends.frie_friend_user_id = users.id \
                                        WHERE \
                                            friends.frie_status = 0 \
                                        AND \
                                            friends.frie_user_id = ?").all(idUser);
        return reply.code(200).send({ requests: requests });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function   getReceivedRequests(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
       const requests = db.prepare("    SELECT \
                                            users.slug  \
                                        FROM \
                                            friends \
                                        INNER JOIN \
                                            users \
                                        ON \
                                            friends.frie_user_id = users.id \
                                        WHERE \
                                            friends.frie_status = 0 \
                                        AND \
                                            friends.frie_friend_user_id = ?").all(idUser);
        return reply.code(200).send({ requests: requests });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}