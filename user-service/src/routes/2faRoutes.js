import { codeSchema } from "../tools/checkFormat.js";
import { activateTwoFa, checkTwoFaCode, desactivateTwoFa } from "../twoFactorAuthentification/2faManager.js";

export default async function routes2FA(fastify) 
{
    fastify.post("/2fa/setup", { preHandler: [fastify.authenticate] }, activateTwoFa);
    fastify.post("/2fa/check", { preHandler: [fastify.authenticate_2fa], schema: {body: codeSchema} }, checkTwoFaCode);
    fastify.post("/2fa/desactivate", { preHandler: [fastify.authenticate] }, desactivateTwoFa);
}
