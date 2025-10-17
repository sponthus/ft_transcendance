import slugify from "slugify";
import { checkUsernameFormat } from "../tools/checkFormat.js";
import { generateUniqueSlug } from "../tools/generateUnique.js";
import { notifyChangeData, notifyChangeSlug } from "../internal-service/notifyServices.js";
import env from '../../config/env.js';

export default async function updateUsername (request, reply)
{
	// TODO : Renvoie le token, pas bon non ? 
	// TODO : Pas de username dans le body = Invalid format for username ?
	// TODO : Mettre son propre username = 409 ? pas sure, preciser l'erreur peut etre
    if (checkUsernameFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for username"} );

    console.log('⚡️⚡️⚡️⚡️⚡️ request.body : ', request.body);

    const db = request.server.db;
    const newUsername = request.body.username;
    const idUser = request.user.idUser;
    try 
    {
        /*if (checkIfUserCanUpdateUsername(db, idUser) == false) //recuperer travail ecole
            return reply.code(400).send( { error: "Username can be change only once a day" } );*/

        const existingUsername = db.prepare('   SELECT \
                                                    1 \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    username = ?').get(newUsername);
        if (existingUsername)
            return reply.code(409).send({error: "Username already exist"});
        const old = db.prepare("    SELECT \
                                        slug, avatar \
                                    FROM \
                                        users \
                                    WHERE \
                                        id = ?").get(idUser);
        const baseSlug = slugify(newUsername, { lower: true, strict: true });
        const ext = old.avatar.split(".").pop();
        const slug = generateUniqueSlug(baseSlug, db);
        const newAvatar = `${slug}.${ext}`;
        console.debug('newAvatar ', newAvatar);
        db.prepare ("   UPDATE \
                            users \
                        SET \
                            username = ?, slug = ?, avatar = ?\
                        WHERE \
                            id = ?").run(newUsername, slug, newAvatar, idUser);
        /*db.prepare (" UPDATE \
                            users \
                        SET \
                            last_username_change = CURRENT_TIMESTAMP \
                        WHERE \
                            id = ?").run(idUser);*/
        notifyChangeData(idUser, newUsername, slug);
        notifyChangeSlug(old.slug , slug);
        const token = await reply.jwtSign({ idUser, newUsername, slug}, {expiresIn: '1h'});
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
            }).send();
    }
    catch (err)
    {
        return reply.code(500).send({ error : "Internal Server Error" + err.message });
    }
}

function checkIfUserCanUpdateUsername (db, idUser)
{
    const   Date = db.prepare("SELECT last_username_change FROM users WHERE id = ?").get(idUser);
    const   creationTime = new Date(Date.last_username_change);
    const   actualTime = new Date();

    const   diff = (actualTime - creationTime) / (1000 * 60 * 60);
    
}