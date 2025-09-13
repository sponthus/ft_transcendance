import registerUser from "./connection/registerUser.js";
import loginUser from "./connection/loginUser.js";
import loginThroughToken from "./connection/loginThroughToken.js";
import updateUsername from "./user-info/updateUsername.js";
import updateNickname from "./user-info/updateNickname.js";
import { changeGameState, getGameState } from "./menu/gameState.js";
import getUserInfo from "./user-info/getUserInfo.js";
import { getCharacterAsset, changeCharacterAsset } from "./menu/characterAsset.js";
import { getNpcAsset, changeNpcAsset } from "./menu/npcAsset.js";
import { changeBackgroundColor, getBackgroundColor } from "./menu/backgroundColor.js";
import { addFriend, removeFriend } from "./menu/friendsList/friendRequest.js";
import { getAllFriends } from "./menu/friendsList/getAllFriends.js";
import { getAllUsers } from "./menu/getAllUsers.js";
import { acceptRequest, getReceivedRequests, getSentRequests, refuseRequest } from "./menu/friendsList/requestHandlers.js";
import updatePassword from "./user-info/updatePassword.js";

//TODO
// Faire la verif de username et du pass dans register
// Faire la verif du nouveau username dans updateUsername
//Mettre a jour user info quand changement de username ou juste passer par le token ?
// pareil pour l'id, Sarah en a besoin

export default async function newRoutes(fastify, options) 
{
    //preHandler oblige l'appel de la fonction authenticate soit appel (pour verifier la validité du token)
    //avant d'excuter la fonction d'après
    //la méthode request.jwtVerify() decode le token et place les donnes du token (payload) dans request.user
    fastify.get("/protected", { preHandler : [fastify.authenticate] }, loginThroughToken);

    fastify.post("/register", registerUser);
    fastify.post("/login", loginUser);

    //pas de page de profil, fonction tester avec curl --> MARCHE :)))))))
    //faudra juste verifier qu'il prend bien le nouveau token
    fastify.get("/user-info", { preHandler: [fastify.authenticate] }, getUserInfo);
    fastify.patch("/user-info/username", { preHandler: [fastify.authenticate] } , updateUsername);
    fastify.patch("/user-info/nickname", { preHandler: [fastify.authenticate] } , updateNickname);
    fastify.patch("/user-info/password", { preHandler: [fastify.authenticate] } , updatePassword);
    //fastify.put("/:slug/avatar", { preHandler: [fastify.authenticate] }, updateAvatar);

    //Routes pour le menu
    fastify.patch("/menu/state", { preHandler: [fastify.authenticate] }, changeGameState);
    fastify.get("/menu/state", { preHandler: [fastify.authenticate] }, getGameState);
    fastify.patch("/menu/character/asset", { preHandler: [fastify.authenticate] }, changeCharacterAsset);
    fastify.get("/menu/character/asset", { preHandler: [fastify.authenticate] }, getCharacterAsset);
    fastify.patch("/menu/npc/asset", { preHandler: [fastify.authenticate] }, changeNpcAsset);
    fastify.get("/menu/npc/asset", { preHandler: [fastify.authenticate] }, getNpcAsset);
    fastify.patch("/menu/color", { preHandler: [fastify.authenticate] }, changeBackgroundColor);
    fastify.get("/menu/color", { preHandler: [fastify.authenticate] }, getBackgroundColor);
    fastify.get("/menu/users", { preHandler: [fastify.authenticate] }, getAllUsers);

    fastify.post("/menu/friendslist", { preHandler: [fastify.authenticate] }, addFriend);
    fastify.delete("/menu/friendslist", { preHandler: [fastify.authenticate] }, removeFriend);
    //fastify.get("/menu/friendslist", { preHandler: [fastify.authenticate] }, addFriend);
    fastify.get("/menu/friendslist/", { preHandler: [fastify.authenticate] }, getAllFriends);
    fastify.get("/menu/friendslist/request/sent", { preHandler: [fastify.authenticate] }, getSentRequests);
    fastify.get("/menu/friendslist/request/received", { preHandler: [fastify.authenticate] }, getReceivedRequests);
    fastify.post("/menu/friendslist/request", { preHandler: [fastify.authenticate] }, acceptRequest);
    fastify.delete("/menu/friendslist/request", { preHandler: [fastify.authenticate] }, refuseRequest);
}