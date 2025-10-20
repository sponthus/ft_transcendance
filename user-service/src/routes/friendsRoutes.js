import { addFriend, removeFriend } from "../menu/friendsList/friendRequest.js";
import { getAllFriends, getAllFriendsBySlug } from "../menu/friendsList/getAllFriends.js";
import { acceptRequest, getReceivedRequests, getSentRequests, rejectRequest } from "../menu/friendsList/requestHandlers.js";
import { slugSchema } from "../tools/checkFormat.js";

export default async function friendsRoutes(fastify)
{ 
    fastify.post("/menu/friendslist", { preHandler: [fastify.authenticate], schema: { body: slugSchema } }, addFriend);
    fastify.delete("/menu/friendslist", { preHandler: [fastify.authenticate], schema: { body: slugSchema } }, removeFriend);
    fastify.get("/menu/friendslist/", { preHandler: [fastify.authenticate] }, getAllFriends);
    fastify.get("/menu/friendslist/:slug", { preHandler: [fastify.authenticate], schema: { params: slugSchema } }, getAllFriendsBySlug);
    fastify.get("/menu/friendslist/request/sent", { preHandler: [fastify.authenticate] }, getSentRequests);
    fastify.get("/menu/friendslist/request/received", { preHandler: [fastify.authenticate] }, getReceivedRequests);
    fastify.post("/menu/friendslist/request", { preHandler: [fastify.authenticate], schema: { body: slugSchema } }, acceptRequest);
    fastify.delete("/menu/friendslist/request", { preHandler: [fastify.authenticate], schema: { body: slugSchema } }, rejectRequest);
}
