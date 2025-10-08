import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"
import { checkIdFormat, checkSlugFormat } from "../../tools/CheckFormat.js"
import { get } from "http";
import { getUserInfoFromId } from "../requests/GetUserInfoFromId.js";

// Gives the full history of a user
// Security : Road is protected to logged-in users, protected from SQLi
export async function getGamesForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/games');

	const { slug } = request.params;
	if (!slug) {
		return reply.status(400).send({ error: 'No slug found in request.'});
	}
	if (checkSlugFormat(slug) === false) {
		return reply.status(400).send({ error: 'Bad slug format.'});
	}

	let userId = 0; 
	const req = await getUserIdFromSlug(slug);
	if (!req.ok) {
		console.error("❌ Unable to get userId from slug");
		return reply.status(404).send({ error: `Requested user ${slug} not found.`});
	} else {
		if (checkIdFormat(req.userId) === false) {
			console.error("❌ Bad userId format got from slug");
			return reply.status(500).send({ error: 'Internal server error: Wrong user data format.'});
		}
		userId = parseInt(req.userId, 10);
		// console.debug("Got userId ", userId, " from slug ", slug);
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting games: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		// console.log("Trying to find games with userId " + userId);
		const games = db.getGamesForUserId(userId);
		if (!games || games.length === 0) {
			return reply.status(200).send([]);
		}
		for (let i = 0; i < games.length; i++) {
			if (games[i].player_a[0] === '@') {
				const playerAId = games[i].player_a.slice(1);
				const playerAName = await getUserInfoFromId(playerAId);
				if (!playerAName.ok || !playerAName.infos || !playerAName.infos.nickname || playerAName.infos.nickname == undefined) {
					console.error("❌ Player nickname not found: ", playerAId);
					return reply.status(404).send({ error: `Player not found.`});
				}
				else {
					games[i].player_a = `@${playerAName.infos.nickname}`;
				} // TODO check me when it's possible to make a game with @user
			}
			if (games[i].player_b[0] === '@') {
				const playerBId = games[i].player_b.slice(1);
				const playerBName = await getUserInfoFromId(playerBId);
				if (!playerBName.ok || !playerBName.infos || !playerBName.infos.nickname || playerBName.infos.nickname == undefined) {
					console.error("❌ Player nickname not found: ", playerBId);
					return reply.status(404).send({ error: `Player not found.`});
				}
				else {
					games[i].player_b = `@${playerBName.infos.nickname}`;
				} // TODO check me when it's possible to make a game with @user
			}
		}
		console.log(`Found ${games.length} games for user ${userId}`);
		return reply.status(200).send(games);
	}
	catch (error) {
		console.error('❌ Error fetching games:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching games'});
	}
}