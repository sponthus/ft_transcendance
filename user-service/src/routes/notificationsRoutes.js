import { countUnreadNotifications, getAllNotifications, getAllSpecificNotifications } from "../menu/notifications/getNotifications.js";
import { markNotificationsRead } from "../menu/notifications/markNotificationsRead.js";
import { actionBodySchema } from "../tools/checkFormat.js";

export default async function notificationsRoutes(fastify)
{    
    fastify.get("/notifications/", { preHandler: [fastify.authenticate] }, getAllNotifications);
    fastify.get("/notifications/unread", { preHandler: [fastify.authenticate] }, (request, reply) =>
    {
        return (getAllSpecificNotifications(request, reply, 0));
    });
    fastify.get("/notifications/read", { preHandler: [fastify.authenticate] }, (request, reply) =>
    {
        return (getAllSpecificNotifications(request, reply, 1)); 
    }); 
    fastify.get("/notifications/unread/count", { preHandler: [fastify.authenticate] }, countUnreadNotifications);
    fastify.post("/notifications/mark", { preHandler: [fastify.authenticate], body: actionBodySchema }, markNotificationsRead);
}