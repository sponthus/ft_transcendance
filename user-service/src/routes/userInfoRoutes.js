import { getUserInfo, getUserInfoBySlug } from "../user-info/getUserInfo.js";
import updateUsername from "../user-info/updateUsername.js";
import updateNickname from "../user-info/updateNickname.js";
import updatePassword from "../user-info/updatePassword.js";
import updateAvatar from "../user-info/updateAvatar.js";

export default async function userInfoRoutes(fastify) 
{
    fastify.get("/user-info", { preHandler: [fastify.authenticate] }, getUserInfo);
    fastify.get("/user-info/other/:slug", { preHandler: [fastify.authenticate] }, getUserInfoBySlug);
    fastify.patch("/user-info/username", { preHandler: [fastify.authenticate] }, updateUsername);
    fastify.patch("/user-info/nickname", { preHandler: [fastify.authenticate] }, updateNickname);
    fastify.patch("/user-info/password", { preHandler: [fastify.authenticate] }, updatePassword);
    fastify.patch("/user-info/avatar", { preHandler: [fastify.authenticate] }, updateAvatar);
}