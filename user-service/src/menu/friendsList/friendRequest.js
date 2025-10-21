import { notifyRefresh } from "../../internal-service/notifyServices.js";
import { addNotification } from "../notifications/notificationsManager.js";

export async function   addFriend(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   friendSlug = request.body.slug;

    try
    {   
        const friend = db.prepare("   SELECT \
                                            id, username \
                                        FROM \
                                            users \
                                        WHERE \
                                            slug = ?").get(friendSlug);
        if (!friend)
            return reply.code(404).send({ error: "This user doesn't exist" });
        if (idUser === friend.id)
            return reply.code(409).send({ error: "You can't be friend with yourself !" });
        const stmt = db.prepare(" SELECT \
                                        frie_status  \
                                    FROM \
                                        friends \
                                    WHERE \
                                        ((frie_user_id = ? AND frie_friend_user_id = ?) \
                                    OR \
                                        (frie_user_id = ? AND frie_friend_user_id = ?)) \
                                    LIMIT 1");
        const status = stmt.get(friend.id, idUser, idUser, friend.id);
        if (status)
        {
            if (status.frie_status === 0)
                return reply.code(409).send({ error: "A friend request is already pending" });
            else if (status.frie_status === 1)
                return reply.code(409).send({ error: "You're already friend with " + friend.username });
        }
        const statement = db.prepare("  INSERT INTO \
                                            friends (frie_user_id, frie_friend_user_id, frie_status) \
                                        VALUES \
                                            (?, ?, 0)");
        const username = db.prepare ("  SELECT \
                                            username \
                                        FROM \
                                            users \
                                        WHERE \
                                            id = ?").get(idUser);
        addNotification(db, friend.id, idUser, "friend_request");
        notifyRefresh(friend.id, username.username, "friend_request");
        statement.run(idUser, friend.id);
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
    const   friendSlug = request.body.slug;

    try
    {
        const friend = db.prepare("   SELECT \
                                            id \
                                        FROM \
                                            users \
                                        WHERE \
                                            slug = ?").get(friendSlug);
        if (!friend)
            return reply.code(404).send({ error: "This user doesn't exist" });
        if (idUser === friend.id)
            return reply.code(409).send({ error: "You can't be friend with yourself !" });
        const statement = db.prepare("  DELETE FROM \
                                            friends \
                                        WHERE \
                                            ((frie_user_id = ? AND frie_friend_user_id = ?) \
                                        OR \
                                            (frie_user_id = ? AND frie_friend_user_id = ?))");
        statement.run(idUser, friend.id, friend.id, idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }   
} 
