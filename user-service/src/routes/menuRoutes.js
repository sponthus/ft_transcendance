import { changeGameState, getGameState } from "../menu/customization/gameState.js";
import { getCharacterAsset, changeCharacterAsset } from "../menu/customization/characterAsset.js";
import { getNpcAsset, changeNpcAsset } from "../menu/customization/npcAsset.js";
import { changeBackgroundColor, getBackgroundColor } from "../menu/customization/backgroundColor.js";
import { getAllUsers } from "../menu/customization/getAllUsers.js";
import { characterAssetSchema, npcAssetSchema, backgroundColorSchema } from "../tools/checkFormat.js";

export default async function menuRoutes(fastify)
{
    fastify.patch("/menu/state", { preHandler: [fastify.authenticate] }, changeGameState);
    fastify.get("/menu/state", { preHandler: [fastify.authenticate] }, getGameState);
    fastify.patch("/menu/character/asset", { preHandler: [fastify.authenticate], schema: {body: characterAssetSchema} }, changeCharacterAsset);
    fastify.get("/menu/character/asset", { preHandler: [fastify.authenticate] }, getCharacterAsset);
    fastify.patch("/menu/npc/asset", { preHandler: [fastify.authenticate], schema: {body: npcAssetSchema} }, changeNpcAsset);
    fastify.get("/menu/npc/asset", { preHandler: [fastify.authenticate] }, getNpcAsset);
    fastify.patch("/menu/color", { preHandler: [fastify.authenticate], schema: {body: backgroundColorSchema} }, changeBackgroundColor);
    fastify.get("/menu/color", { preHandler: [fastify.authenticate] }, getBackgroundColor);
    fastify.get("/menu/users", { preHandler: [fastify.authenticate] }, getAllUsers);
}
