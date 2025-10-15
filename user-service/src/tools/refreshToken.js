import env from "../../config/env.js";

export function refreshToken(fastify, user, reply)
{
	const newToken = fastify.jwt.sign(
	{
		idUser: user.idUser,
		username: user.username,
		slug: user.slug
	}, 
	{ expiresIn: '1h' });
	let secure = false;
	if (env.nodeEnv === 'production')
		secure = true;
	reply.setCookie('token', newToken, {
		httpOnly: true,
		signed: true,
		secure: secure,
		path: '/',
		maxAge: 3600000
	});
	console.log("Token refreshed in user-service" + newToken);
}