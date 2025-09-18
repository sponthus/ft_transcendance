import registerUser from "../connection/registerUser.js";
import loginUser from "../connection/loginUser.js";
import loginThroughToken from "../connection/loginThroughToken.js";

export default async function authRoutes(fastify) 
{
    fastify.post("/register", registerUser);
    fastify.post("/login", loginUser);
    fastify.get("/protected", { preHandler: [fastify.authenticate] }, loginThroughToken);
}
