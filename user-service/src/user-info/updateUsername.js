import slugify from "slugify";
import { checkUsernameFormat } from "../tools/checkFormat.js";
import generateUniqueSlug from "../tools/generateUniqueSlug.js";

export default async function updateUsername (request, reply)
{
    if (checkUsernameFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for username"} );

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
            return reply.code(409).send({error: "Username already exist ICIC"});

        const baseSlug = slugify(newUsername, { lower: true, strict: true });
        const slug = generateUniqueSlug(baseSlug, db);
        const updateSlugAndUsername = db.transaction( (newUsername, idUser, slug) =>
        {
            db.prepare ("    UPDATE \
                                users \
                            SET \
                                username = ? \
                            WHERE \
                                id = ?").run(newUsername, idUser);
            db.prepare ("    UPDATE \
                                users \
                            SET \
                                last_username_change = CURRENT_TIMESTAMP \
                            WHERE \
                                id = ?").run(idUser);
            db.prepare ("  UPDATE \
                                users \
                            SET \
                                slug = ? \
                            WHERE \
                                id = ?").run(slug, idUser);
        });
        updateSlugAndUsername(newUsername, idUser, slug);
        const token = await reply.jwtSign({ idUser, newUsername, slug}, {expiresIn: '1h'});
        return reply.code(200).send({ token : token });
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