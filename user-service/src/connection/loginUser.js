import bcrypt from "bcrypt";
import env from '../../config/env.js';
import { notifyChangeData } from "../internal-service/notifyServices.js";

export default async function loginUser (request, reply)
{
    const db = request.server.db;
    const { username, password } = request.body;

    if (!username || !password)
        return (reply.code(400).send({message: "Username and password are required"}));

    try 
    {
        const userData = db.prepare("   SELECT \
                                            * \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(username);
        if (!userData || userData && !userData.pw_hash)
            return (reply.code(401).send({message: "Username or password invalid"}));
        if ((bcrypt.compareSync(password, userData.pw_hash) == false))
            return(reply.code(401).send({message: "Username or password invalid"}));
        const idUser = userData.id;
        const slug = userData.slug;
        let token = 0;
        if (userData.twofa_enabled === 1)
            token = await reply.jwtSign({ idUser, username, slug, twofa_pending: true }, {expiresIn: '3m'});
        else
            token = await reply.jwtSign({ idUser, username, slug }, {expiresIn: '1h'});
        let secure = false;
        if (env.nodeEnv === 'production')
            secure = true;
		notifyChangeData(idUser, username, slug, "online");
        return reply.code(200).setCookie('token', token,
            {
                httpOnly: true, 
                signed: true,
                secure: secure, 
                path: '/', 
                maxAge: 3600000
            }).send({ twoFaEnabled: userData.twofa_enabled });
    }
    catch (err)
    {
		console.error(err);
        return (reply.code(500).send( {message: "Internal Server Error" + err} ));
    }
}
