import { uploadAvatar } from "./put.controller.js";

export default async function routes(fastify, options) {
    console.log('Registering routes');

    fastify.register(
        async function (putRoutes) {
            putRoutes.put('/',
                {preHandler: [fastify.authenticate]},
                uploadAvatar);
        },
        async function (patchRoutes) {
            patchRoutes.put('/update-name',
                {preHandler: [fastify.verifyApiKey]},
                updateName);
        }
    );
}