import { addFriend, removeFriend } from "../menu/friendsList/friendRequest.js";
import { getAllFriends } from "../menu/friendsList/getAllFriends.js";
import { acceptRequest, getReceivedRequests, getSentRequests, rejectRequest } from "../menu/friendsList/requestHandlers.js";

export default async function friendsRoutes(fastify)
{
    fastify.post("/menu/friendslist", { preHandler: [fastify.authenticate] }, addFriend);
    fastify.delete("/menu/friendslist", { preHandler: [fastify.authenticate] }, removeFriend);
    fastify.get("/menu/friendslist/", { preHandler: [fastify.authenticate] }, getAllFriends);
    fastify.get("/menu/friendslist/request/sent", { preHandler: [fastify.authenticate] }, getSentRequests);
    fastify.get("/menu/friendslist/request/received", { preHandler: [fastify.authenticate] }, getReceivedRequests);
    fastify.post("/menu/friendslist/request", { preHandler: [fastify.authenticate] }, acceptRequest);
    fastify.delete("/menu/friendslist/request", { preHandler: [fastify.authenticate] }, rejectRequest);
}
