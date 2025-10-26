import bcrypt from "bcrypt";

export default async function   updatePassword (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   newPassword = request.body.password;
    
    try
    {
        let saltRounds = 10;
        const pw_hash = bcrypt.hashSync(newPassword, saltRounds);
        db.prepare("    UPDATE \
                            users \
                        SET \
                            pw_hash = ? \
                        WHERE \
                            id = ?").run(pw_hash, idUser);
        return reply.code(200).send();
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}
