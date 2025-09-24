import { activateTwoFa, checkTwoFaCode } from "../twoFactorAuthentification/2faManager.js";

export default async function routes2FA(fastify) 
{
    fastify.post("/2fa/setup", { preHandler: [fastify.authenticate] }, activateTwoFa);
    fastify.post("/2fa/validate", { preHandler: [fastify.authenticate] }, checkTwoFaCode);
    fastify.post("/2fa/verify", { preHandler: [fastify.authenticate] }, checkTwoFaCode);
}
