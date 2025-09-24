import { activateTwoFa, validateTwoFa } from "../twoFactorAuthentification/2faManager.js";

export default async function routes2FA(fastify) 
{
    fastify.post("/2fa/setup", { preHandler: [fastify.authenticate] }, activateTwoFa);
    fastify.post("/2fa/validate", { preHandler: [fastify.authenticate] }, validateTwoFa);
}
