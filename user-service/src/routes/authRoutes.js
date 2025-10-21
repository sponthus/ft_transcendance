import  registerUser  from "../connection/registerUser.js";
import loginUser from "../connection/loginUser.js";
import loginThroughToken from "../connection/loginThroughToken.js";
import logoutUser from "../connection/logoutUser.js";
import { loginThroughGithub } from "../connection/OAuthGithub.js";
import { registrationSchema } from "../tools/checkFormat.js";

export default async function authRoutes(fastify) 
{
    fastify.post("/register",  { schema: { body: registrationSchema } }, registerUser);
    fastify.post("/login", { schema: { body: registrationSchema } }, loginUser);
    fastify.get("/oauth/github/callback", loginThroughGithub);
    fastify.post("/logout",{ preHandler: [fastify.authenticate] }, logoutUser);
    fastify.get("/protected", { preHandler: [fastify.authenticate] }, loginThroughToken);
}
