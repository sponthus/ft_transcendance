import OAuth2 from '@fastify/oauth2'

export function initOAuthGithub(fastify)
{
    fastify.register(OAuth2, 
    {
        name: 'auth',
        credentials:
        {
            client:
            {
                id: 'Ov23lijqBPrCzLQcc0wp', //stocker env
                secret: '230f856441da9b0a7cf75b3797dcf84b24a1bc7b' //stocker dans env ou secret
            },
            auth: OAuth2.GITHUB_CONFIGURATION,
        },
        // du coup pas de reply.send ? ca pose probleme ?
        startRedirectPath: '/oauth/github', //route appeler par le front, pas besoin de fastify.get
        callbackUri: 'http://localhost:3001/api/user/oauth/github/callback',
    });
}

//utilsie cookie pour envoyer un state a github, qui lui renvoie pour verifier l 'authenticite.
//le meme concept que github qui envoie un code et que notre service lui renvoie

/*import { Strategy } from "passport-github2"

const githubStrategy = new Strategy(
{
    clientID: "Ov23lijqBPrCzLQcc0wp",
    clientSecret: "230f856441da9b0a7cf75b3797dcf84b24a1bc7b",
    callbackURL: "http://localhost:5173/"
},
function (accessToken, refreshToken, profile, done)
{
       console.log('Profile :', profile);
       return done(null, profile);
});

export default githubStrategy;*/