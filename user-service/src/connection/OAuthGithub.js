import OAuth2 from '@fastify/oauth2'
import crypto from 'crypto';
import { getSecret } from '../index.js';
import env from '../../config/env.js';
import prefix from '../tools/url.js';
import fetch from 'node-fetch';
import slugify from "slugify";
import { generateUniqueUsername, generateUniqueSlug } from '../tools/generateUnique.js';
import { notifyChangeData } from '../internal-service/notifyServices.js';


export function initOAuthGithub(fastify)
{
	let link = `${prefix}://localhost:5173/api/user/oauth/github/callback`;
	if (env.nodeEnv === 'production') {
		link = `${prefix}://${env.host}:4443/api/user/oauth/github/callback`;
	}
    const oauthStateMap = new Map();
    fastify.register(OAuth2, 
    {
        name: 'auth',
        credentials:
        {
            client:
            {
                id: getSecret('git_id'),
                secret: getSecret('git_secret')
            },
            auth: OAuth2.GITHUB_CONFIGURATION,
        },
        startRedirectPath: '/oauth/github',
        callbackUri: link,


        generateStateFunction: (request) => {
          const state = crypto.randomBytes(16).toString('hex');
          console.debug('State: ', state);
          oauthStateMap.set(state, true);
          return state;
        },

        checkStateFunction: (request, callback) => {
            console.debug(request.query);
            console.debug(request.url);
           // console.debug(request.query.state);
            console.debug('map : ', oauthStateMap);
            const state = request.url.split('state=')[1];

            console.log(state)

            if (!oauthStateMap.has(state)) {
                callback(new Error('Invalid state'));
                return;
            }
            oauthStateMap.delete(state);
            callback();
        }
    });
}

export async function loginThroughGithub(request, reply)
{
    const fastify = request.server;

    let accessToken
        accessToken = await fastify.auth.getAccessTokenFromAuthorizationCodeFlow(request); //Code de l'url envoyer pat github, renvoyer par mon service pour avoir le token
    try
    {
        const userInfo = await createUserWithGithubInfos(accessToken.token.access_token, fastify.db);
        if (userInfo.error)
            reply.code(401).send({ message: userInfo.error});
        let token;
        let twofa = false;
        if (userInfo.twoFa === 1)
        {
            twofa = true;
            token = await reply.jwtSign({ idUser: userInfo.idUser, username: userInfo.username, slug: userInfo.slug, twofa_pending: true }, {expiresIn: '3m'});
        }
        else
            token = await reply.jwtSign({ idUser: userInfo.idUser, username: userInfo.username, slug: userInfo.slug }, {expiresIn: '1h'});
        // console.debug("\nidUser: ", userInfo.idUser);
        // console.debug("\nusername: : ", userInfo.username);
        // console.debug("\nslug: : ", userInfo.slug);
        // console.debug('GITHUB token : ', token);

		console.log("Asking for online");
		notifyChangeData(userInfo.idUser, userInfo.username, userInfo.slug, "online");
        let secure = false;
        if (env.nodeEnv === 'production')
            secure = true;

		let link = `${prefix}://localhost:5173/`;
		if (env.nodeEnv === 'production') {
			link = `${prefix}://${env.host}:4443/`;
		}
        console.log("Succesfully connected with github")
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
        reply.code(500).send({ message: "Internal Server Error" });
    }
}

async function createUserWithGithubInfos(AccessToken, db)
{
    const result = await getInfoFromGithub(AccessToken);
    if (!result.ok)
        return {result};
    const githubUsername = result.userInfo.login;
    const existingGithubUsername = db.prepare(" SELECT \
                                                    1 \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    github_username = ?").get(githubUsername);
    if (existingGithubUsername)
    {
        console.log("username github exist");
        const user = db.prepare("   SELECT \
                                        id, username, slug, twofa_enabled \
                                    FROM \
                                        users \
                                    WHERE \
                                        github_username = ?").get(githubUsername);
        return { idUser: user.id, username: user.username, slug: user.slug, twoFa: user.twofa_enabled}; 
    }
    console.log("username github doesn't exist");
    const existingUsername = db.prepare("   SELECT \
                                                1 \
                                            FROM \
                                                users \
                                            WHERE \
                                                username = ? ").get(githubUsername);
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
                                            users (username, slug, avatar, github_username) \
                                        VALUES \
                                            (?, ?, ?, ?)');
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
        return { ok: false, message: "Github authentification failed" };  
}