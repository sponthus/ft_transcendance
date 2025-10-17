import { uploadAvatar, updateName } from "./controller.js";

export default async function routes(fastify, options) {
    console.log('Registering routes');

    fastify.register(
        async function (putRoutes) {
            putRoutes.put('/',
                {preHandler: [fastify.authenticate]},
                uploadAvatar);
        },
        async function (patchRoutes) {
            patchRoutes.patch('/update-name',
                {preHandler: [fastify.verifyApiKey]},
                updateName);
        }
    );
}