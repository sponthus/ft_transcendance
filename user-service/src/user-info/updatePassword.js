import { checkPasswordFormat } from "../tools/checkFormat.js";
import bcrypt from "bcrypt";

export default async function   updatePassword (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   newPassword = request.body.password;

    if (checkPasswordFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for password"} );

    try
    {
        let saltRounds = 10;//nombre de tour de calcul
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
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}
