import slugify from "slugify";
// import { checkUsernameFormat } from "../tools/checkFormat.js";
import { generateUniqueSlug } from "../tools/generateUnique.js";
import { notifyChangeData, notifyChangeSlug } from "../internal-service/notifyServices.js";
import env from '../../config/env.js';

export default async function updateUsername (request, reply)
{
    const db = request.server.db;
    const newUsername = request.body.username;
    const idUser = request.user.idUser;
    try 
    {
        const existingUsername = db.prepare('   SELECT \
                                                    1 \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    username = ?').get(newUsername);
        if (existingUsername) {
			console.warn('Username already exist : ', newUsername);
            return reply.code(409).send({message: "Username already exist"});
		}
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
        notifyChangeData(idUser, newUsername, slug, "online");
        notifyChangeSlug(old.slug , slug);
        const token = await reply.jwtSign({ idUser, username: newUsername, slug}, {expiresIn: '1h'});
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
		console.error(err);
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}