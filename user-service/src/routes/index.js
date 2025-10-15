import authRoutes from './authRoutes.js';
import userInfoRoutes from './userInfoRoutes.js';
import menuRoutes from './menuRoutes.js';
import friendsRoutes from './friendsRoutes.js';
import internalRoutes from './internalRoutes.js';
import notificationsRoutes from './notificationsRoutes.js';
import routes2FA from './2faRoutes.js';
import tournamentRoutes from './tournamentRoutes.js';

export default async function newRoutes(fastify, options)
{
    await authRoutes(fastify);
    await userInfoRoutes(fastify);
    await menuRoutes(fastify);
    await friendsRoutes(fastify);
    await internalRoutes(fastify);
    await notificationsRoutes(fastify);
    await routes2FA(fastify);
  //  await OAuthRoutes(fastify); // a mettre ailleurs ??
    await tournamentRoutes(fastify);
}