import fetch from 'node-fetch'
import slugify from "slugify";
import { generateUniqueUsername, generateUniqueSlug } from '../tools/generateUnique.js';

export default async function OAuthRoutes(fastify) 
{
    fastify.get("/oauth/github/callback", async (request, reply) =>
    {
       const accessToken = await fastify.auth.getAccessTokenFromAuthorizationCodeFlow(request);
        try
        {
            const userInfo = await createUserWithGithubInfos(accessToken.token.access_token, db);
            if (userInfo.error)
                reply.code(401).send({ error: userInfo.error});
            const token = await reply.jwtSign({ idUser: userInfo.idUser, username: userInfo.username, slug: userInfo.slug }, {expiresIn: '1h'});
            console.log("\nidUser: ", userInfo.idUser);
            console.log("\nusername: : ", userInfo.username);
            console.log("\nslug: : ", userInfo.slug);
            console.log("Le compte github existe deja");
            return reply.code(200).send({ token }); 
        }
        catch (err)
        {
            console.log(err);
            reply.code(500).send({ error: "Internal Server Error" + err.message });
        }
       // reply.code(200).send({ access_token: token.access_token }); //pk renvoyer ca ?
    });
}

async function createUserWithGithubInfos(AccessToken, db)
{
    const result = await getInfoFromGithub(AccessToken);
    if (!result.ok)
        return {result};
  //  console.log('User Info Github : ', result.userInfo);
    const githubUsername = result.userInfo.login;
    const existingGithubUsername = db.prepare(" SELECT \
                                                    * \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    github_username = ?").get(githubUsername);
    if (existingGithubUsername)
    {
        console.log("username github exist");
        const user = db.prepare("   SELECT \
                                        id, username, slug \
                                    FROM \
                                        users \
                                    WHERE \
                                        github_username = ?").get(githubUsername);
        return { idUser: user.id, username: user.username, slug: user.slug }; 
    }
    console.log("username github doesn't exist");
    const existingUsername = db.prepare("   SELECT \
                                                1 \
                                            FROM \
                                                users \
                                            WHERE \
                                                username = ?").get(githubUsername);
    let username;
    if (existingUsername)
        username = generateUniqueUsername(githubUsername, db);
    else
        username = githubUsername;
    const baseSlug = slugify(username, { lower: true, strict: true });
    const slug = generateUniqueSlug(baseSlug, db);
    const avatar = 'default.jpg';
    const createAccountWithGithub = db.transaction( (username, slug, avatar, githubUsername) =>
    {
        let statement = db.prepare('    INSERT INTO \
                                            users (username, slug, avatar, last_username_change, github_username) \
                                        VALUES \
                                            (?, ?, ?, CURRENT_TIMESTAMP, ?)');
        const result = statement.run(username, slug, avatar, githubUsername);
        const idUser = result.lastInsertRowid;
        statement = db.prepare('    INSERT INTO \
                                        menu_state (menu_user_id) \
                                    VALUES \
                                        (?)');
        statement.run(idUser);
        return (idUser);
    });
    const idUser = createAccountWithGithub(username, slug, avatar, githubUsername);
    return {idUser, username, slug};
}


async function getInfoFromGithub(token)
{
    const res = await fetch('https://api.github.com/user',
    {
        method: 'GET',
        headers: { 'Authorization': `token ${token}` },
    });
    const userInfo = await res.json();
    if (res.ok)
    {
        return { ok: true, userInfo };
    }
    else
        return { ok: false, error: "Github authentification failed" };  
}