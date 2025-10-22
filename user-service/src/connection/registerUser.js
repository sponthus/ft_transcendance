import { generateUniqueSlug } from "../tools/generateUnique.js";
import { notifyChangeData } from "../internal-service/notifyServices.js";
import env from '../../config/env.js';
import bcrypt from "bcrypt";
import slugify from "slugify";

export default async function registerUser(request, reply) 
{
    const db = request.server.db;
    const avatar = 'default.jpg'
    const username = request.body.username;
    const password = request.body.password;

    const existingUser = db.prepare('   SELECT \
                                            1 \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?').get(username);
    if (existingUser)
        return reply.code(409).send({message: "Username already exist"});

    try 
    {
        const baseSlug = slugify(username, { lower: true, strict: true });
        const slug = generateUniqueSlug(baseSlug, db);
    
        let saltRounds = 10;
        const pw_hash = bcrypt.hashSync(password, saltRounds);

        const idUser = fillInfoUserInDb(db, username, slug, avatar, pw_hash);
        const token = await reply.jwtSign({ idUser, username, slug }, {expiresIn: '1h'});
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
                //TODO mettre same site
            }).send();
    }
    catch (err)
    {
        return (reply.code(500).send( {message: "Internal Server Error" + err.message} ));
    }
}

function fillInfoUserInDb(db, username, slug, avatar, pw_hash = null)
{
    let statement;

    const sqlRequest = db.transaction( (username, slug, avatar, pw_hash) =>
    {
        statement = db.prepare('    INSERT INTO \
                                        users (username, slug, avatar, last_username_change, pw_hash) \
                                    VALUES \
                                        (?, ?, ?, CURRENT_TIMESTAMP, ?)');
        const result = statement.run(username, slug, avatar, pw_hash);
        const idUser = result.lastInsertRowid;
        statement = db.prepare('    INSERT INTO \
                                        menu_state (menu_user_id) \
                                    VALUES \
                                        (?)');
        statement.run(idUser);
        return (idUser);
    });
    const idUser = sqlRequest(username, slug, avatar, pw_hash);
    return (idUser);
}