import fetch from 'node-fetch'
import slugify from "slugify";
import { generateUniqueUsername, generateUniqueSlug } from '../tools/generateUnique.js';
import { fillInfoUserInDb } from '../connection/registerUser.js';

export default async function OAuthRoutes(fastify) 
{
    fastify.get("/oauth/github/callback", async (request, reply) =>
    {

        const db = fastify.db;
        const test = db.prepare("   SELECT \
                                        username \
                                    FROM \
                                        users").all();
        console.log('Test = ', test);

        const accessToken = await fastify.auth.getAccessTokenFromAuthorizationCodeFlow(request);
        try
        {
            const userInfo = await createUserWithGithubInfos(accessToken.token.access_token, db);
            if (userInfo.error)
                reply.code(401).send({ error: userInfo.error});
            const token = await reply.jwtSign({ idUser: userInfo.idUser, username: userInfo.username, slug: userInfo.slug }, {expiresIn: '1h'});
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
    console.log('Login : ', result.userInfo.login);
    let existingGithubUsername;
    const tran = db.prepare("     SELECT \
                                                        * \
                                                    FROM \
                                                        users \
                                                    WHERE \
                                                        github_username = ?");
    existingGithubUsername = tran.get(result.userInfo.login);
    console.log('GITHUB', existingGithubUsername);
   // return 1
    //console.log('verifier : ', existingGithubUsername);
    if (existingGithubUsername)
    {
        console.log("username github exist");
        const user = db.prepare("   SELECT \
                                        id, username, slug \
                                    FROM \
                                        users \
                                    WHERE \
                                        github_username = ?").get(result.userInfo.login);
        return { idUser: user.id, username: user.username, slug: user.slug }; 
    }
    console.log("username github doesn't exist");
    const existingUsername = db.prepare("   SELECT \
                                                1 \
                                            FROM \
                                                users \
                                            WHERE \
                                                username = ?").get(result.userInfo.login);
    let username = result.userInfo.login;
    if (existingUsername)
        username = generateUniqueUsername(result.userInfo.login)
    const baseSlug = slugify(username, { lower: true, strict: true });
    const slug = generateUniqueSlug(baseSlug, db);
    const avatar = 'default.jpg';
    //fill github username, slug, avatar, pass
    const idUser = fillInfoUserInDb(db, username, slug, avatar);
    db.prepare("    UPDATE \
                        users \
                    SET \
                        github_username = ? \
                    WHERE \
                        id = ?").run(result.userInfo.login, idUser);
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