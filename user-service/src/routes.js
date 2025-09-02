//FICHIER OBSOLETE

import { createUser, getUser, loginUser, modifyUser, modifyAvatar } from "./users.controller.js";

// TODO implement routes
export default async function routes(fastify, options) {
    console.log('Registering routes');

    // Register post routes
    fastify.register(
        async function (postRoutes) {
            // postRoutes.addHook('preHandler', async (request, reply) => {
            //     console.log('preHandler called for:', request.url);
            // });

            postRoutes.post("/register",
                createUser);
            postRoutes.post("/login",
                loginUser);
        }
        // { prefix: "/api/user/" }
    );

    // Register get routes
    fastify.register(
        // TODO : Function probably not working, weird stuff; when you delete DB the request still says OK ...
        async function (getRoutes) {
            getRoutes.get('/protected',
                {onRequest: [fastify.authenticate]},
                async (req, reply) => {
                    req.log.info({userId: req.user.id}, `User ${req.user.id} accessed /me`);
                    const user = req.user;
                    console.log(user);
                    return {
                        username: user.username,
                        slug: user.slug,
                        id: user.id,
                    };
                });

            getRoutes.get('/:slug',
                {preHandler: [fastify.authenticate]},
                getUser);
        }
        // { prefix: "/api" }
    );

    fastify.register(
        async function (putRoutes) {
            putRoutes.put('/:slug',
                {preHandler: [fastify.authenticate]},
                modifyUser);
            putRoutes.put('/:slug/avatar',
                {preHandler: [fastify.authenticate]},
                modifyAvatar);
        }
        // { prefix: "/api" }
    );
}