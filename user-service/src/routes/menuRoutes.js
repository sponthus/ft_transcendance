import { changeGameState, getGameState } from "../menu/gameState.js";
import { getCharacterAsset, changeCharacterAsset } from "../menu/characterAsset.js";
import { getNpcAsset, changeNpcAsset } from "../menu/npcAsset.js";
import { changeBackgroundColor, getBackgroundColor } from "../menu/backgroundColor.js";
import { getAllUsers } from "../menu/getAllUsers.js";

export default async function menuRoutes(fastify)
{
    fastify.patch("/menu/state", { preHandler: [fastify.authenticate] }, changeGameState);
    fastify.get("/menu/state", { preHandler: [fastify.authenticate] }, getGameState);
    fastify.patch("/menu/character/asset", { preHandler: [fastify.authenticate] }, changeCharacterAsset);
    fastify.get("/menu/character/asset", { preHandler: [fastify.authenticate] }, getCharacterAsset);
    fastify.patch("/menu/npc/asset", { preHandler: [fastify.authenticate] }, changeNpcAsset);
    fastify.get("/menu/npc/asset", { preHandler: [fastify.authenticate] }, getNpcAsset);
    fastify.patch("/menu/color", { preHandler: [fastify.authenticate] }, changeBackgroundColor);
    fastify.get("/menu/color", { preHandler: [fastify.authenticate] }, getBackgroundColor);
    fastify.get("/menu/users", { preHandler: [fastify.authenticate] }, getAllUsers);
}
