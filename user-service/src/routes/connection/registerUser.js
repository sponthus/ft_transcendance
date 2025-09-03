import Ajv from "ajv"
import bcrypt from "bcrypt";
import slugify from "slugify";

export default async function registerUser(request, reply) 
{
     if (checkFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format for username or password"} );
    
    const db = request.server.db;
    const avatar = 'default.jpg'
    const username = request.body.username;
    const password = request.body.password;

    //pourquoi le username peut pas etre defaut ?
    const existingUser = db.prepare('   SELECT \
                                            1 \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?').get(username);
    if (existingUser) ////get renvoie soit un objet sur la cmd au dessus ou un undefined
        return reply.code(409).send({error: "Username already exist"});

    const baseSlug = slugify(username, { lower: true, strict: true });
    const slug = generateUniqueSlug(baseSlug, db); //verifier pas doublon
    
    let saltRounds = 10;//nombre de tour de calcul
    const pw_hash = bcrypt.hashSync(password, saltRounds);
    let idUser = -1;
    try 
    {
        idUser = fillInfoUserInDb(db, username, slug, avatar, pw_hash);
        const token = await reply.jwtSign({ idUser, username, slug }, {expiresIn: '1h'});
        return reply.code(200).send({ token: token, username: username, slug: slug });
    }
    catch (err)
    {
        //plus besoin de delete, db.transaction fait un rollback automatique si code sql echoue
        return (reply.code(500).send( {error : "Internal Server Error" + err.message} ));
    }
}

function    checkFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            username: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z]).+$"},
            password: { type: "string", minLength: 6, maxLength: 15, pattern: "^(?=.*[a-zA-Z]).+$"},
        },
        required: ["username", "password"],
        additionalProperties: false
    };
    const ajv = new Ajv();
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}

function generateUniqueSlug(baseSlug, db)
{
    let slug = baseSlug;
    let counter = 1;

    const dbFindings = db.prepare("SELECT COUNT(*) AS count FROM users WHERE slug = ?");
    while (dbFindings.get(slug).count > 0)
    {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

function fillInfoUserInDb(db, username, slug, avatar, pw_hash)
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


/*Différence entre .get() et .run() avec better-sqlite3 (ou API SQLite similaire) :

    .get(params) :

        Exécute la requête et retourne la première ligne du résultat, sous forme d'objet JavaScript.

        Utile pour les requêtes SELECT où tu attends au plus une ligne (par exemple, vérifier l’existence d’un utilisateur).

        Si aucune ligne n’est trouvée, ça retourne undefined.

    .run(params) :

        Exécute la requête, mais ne retourne pas de ligne.

        Utilisé surtout pour les requêtes INSERT, UPDATE, DELETE, c’est-à-dire des commandes qui modifient la base.

        .run() renvoie un objet info avec quelques données sur l’opération (nombre de lignes affectées, dernier ID inséré, etc.), mais pas de résultat de sélection.
*/
