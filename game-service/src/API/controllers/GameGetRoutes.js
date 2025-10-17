import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"
import { checkIdFormat, checkSlugFormat } from "../../tools/CheckFormat.js"
import { getUserInfoFromId } from "../requests/GetUserInfoFromId.js";

// Gives the full history of a user
// Security : Road is protected to logged-in users, protected from SQLi
export async function getGamesForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/games');

	const { slug } = request.params;
	if (!slug) {
		return reply.code(400).send({ error: 'No slug found in request.'});
	}
	if (checkSlugFormat(slug) === false) {
		return reply.code(400).send({ error: 'Bad slug format.'});
	}

	let userId = 0; 
	const req = await getUserIdFromSlug(slug);
	if (!req.ok) {
		console.error("❌ Unable to get userId from slug");
		return reply.code(404).send({ error: `Requested user ${slug} not found.`});
	} else {
		if (checkIdFormat(req.userId) === false) {
			console.error("❌ Bad userId format got from slug");
			return reply.code(400).send({ error: 'Wrong user data format.'});
		}
		userId = parseInt(req.userId, 10);
		// console.debug("Got userId ", userId, " from slug ", slug);
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting games: database connection not found');
		return reply.code(500).send({ error: 'Internal server error.'});
	}

	try {
		let idsDict = new Map();

		// console.log("Trying to find games with userId " + userId);
		let games = db.getGamesForUserId(userId);
		if (!games || games.length === 0) {
			return reply.code(200).send([]);
		}
		for (let i = 0; i < games.length; i++) {
			if (games[i].created_by) {
				const creatorId = Number(games[i].created_by);
				if (idsDict.has(creatorId) === true) {
					games[i].created_by = `@${idsDict.get(creatorId)}`;
					// console.debug("👌 Using cache data");
				} else {
					const creatorName = await getUserInfoFromId(creatorId);
					if (!creatorName.ok || !creatorName.infos || !creatorName.infos.slug || creatorName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", creatorId);
						games[i].created_by = `@PlayerNotFound`;
					}
					else {
						idsDict.set(creatorId, creatorName.infos.slug);
						games[i].created_by = `@${idsDict.get(creatorId)}`;
					}
				}
			}
			if (games[i].player_a && games[i].player_a[0] === '@') {
				const playerAId = Number(games[i].player_a.slice(1));
				if (idsDict.has(playerAId) === true) {
					games[i].player_a = `@${idsDict.get(playerAId)}`;
					// console.debug("👌 Using cache data");
				} else {
					const playerAName = await getUserInfoFromId(playerAId);
					if (!playerAName.ok || !playerAName.infos || !playerAName.infos.slug || playerAName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", playerAId);
						games[i].player_a = `@PlayerNotFound`;
					}
					else {
						idsDict.set(playerAId, playerAName.infos.slug);
						games[i].player_a = `@${idsDict.get(playerAId)}`;
					}
				}
			}
			if (games[i].player_b && games[i].player_b[0] === '@') {
				const playerBId = Number(games[i].player_b.slice(1));
				if (idsDict.has(playerBId) === true) {
					games[i].player_b = `@${idsDict.get(playerBId)}`;
					// console.debug("👌 Using cache data");
				} else {
					const playerBName = await getUserInfoFromId(playerBId);
					if (!playerBName.ok || !playerBName.infos || !playerBName.infos.slug || playerBName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", playerBId);
						games[i].player_b = `@PlayerNotFound`;
					}
					else {
						idsDict.set(playerBId, playerBName.infos.slug);
						games[i].player_b = `@${idsDict.get(playerBId)}`;
					}
				}
			}
			if (games[i].winner && games[i].winner[0] === '@') {
				const winnerId = Number(games[i].winner.slice(1));
				if (idsDict.has(winnerId) === true) {
					games[i].winner = `@${idsDict.get(winnerId)}`;
					// console.debug("👌 Using cache data");
				} else {
					const winnerName = await getUserInfoFromId(winnerId);
					if (!winnerName.ok || !winnerName.infos || !winnerName.infos.slug || winnerName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", winnerId);
						games[i].winner = `@PlayerNotFound`;
					}
					else {
						idsDict.set(winnerId, winnerName.infos.slug);
						games[i].winner = `@${idsDict.get(winnerId)}`;
					}
				}
			}
		}
		console.log(`Found ${games.length} games for user ${userId}`);
		console.debug(games); // To show the found data
		return reply.code(200).send(games);
	}
	catch (error) {
		console.error('❌ Error fetching games:');
		console.log(error);
		return reply.code(500).send({error: 'Internal server error.'});
	}
}