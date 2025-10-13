import bcrypt from "bcrypt";
import env from '../../config/env.js';
import { checkRegistrationFormat } from "../tools/checkFormat.js";

export default async function loginUser (request, reply)
{
    const db = request.server.db;
    const { username, password } = request.body;

    if (!username || !password)
        return (reply.code(400).send({error : "Username and password are required"}));

    if (checkRegistrationFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for username or password"} );

    try 
    {
        const userData = db.prepare("   SELECT \
                                            * \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(username);
        if (!userData)
            return (reply.code(401).send({error : "Username or password invalid"}));
        if ((bcrypt.compareSync(password, userData.pw_hash) == false))
            return(reply.code(401).send({error : "Username or password invalid"})); //message generique pour les attaques
        const idUser = userData.id;
        const slug = userData.slug;
        let token = 0;
        if (userData.twofa_enabled === 1)
            token = await reply.jwtSign({ idUser, username, slug, twofa_pending: true }, {expiresIn: '3m'});
        else
            token = await reply.jwtSign({ idUser, username, slug }, {expiresIn: '2m'});
        let secure = false;
        if (env.nodeEnv === 'production')
            secure = true;
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
        return (reply.code(500).send( {error : "Internal Server Error" + err.message} ));
    }
}