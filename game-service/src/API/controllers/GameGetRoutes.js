import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"
import { checkIdFormat, checkSlugFormat } from "../../tools/CheckFormat.js"

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
		console.log("❌ Unable to get userId from slug");
		return reply.status(404).send({ error: "Requested user not found."});
	} else {
		if (checkIdFormat(req.userId) === false) {
			console.log("❌ Bad userId format got from slug");
			return reply.status(500).send({ error: 'Internal server error: Wrong user data format.'});
		}
		userId = parseInt(req.userId, 10);
		console.log("Got userId ", userId, " from slug ", slug);
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
				const playerAName = await getUserIdFromSlug(playerAId);
				if (playerAName.ok) {
					games[i].player_a = `@${playerAName.nickname}`;
				} // TODO check me
			}
			if (games[i].player_b[0] === '@') {
				const playerBId = games[i].player_b.slice(1);
				const playerBName = await getUserIdFromSlug(playerBId);
				if (playerBName.ok) {
					games[i].player_b = `@${playerBName.nickname}`;
				} // TODO check me
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