import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"
import { getUserInfoFromId } from "../requests/GetUserInfoFromId.js"
// import { checkIdFormat, checkSlugFormat } from "../../tools/CheckFormat.js"

// Gives the list of tournaments linked to a player
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentsForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/tournaments');

	const { slug } = request.params;
	if (!slug) {
		return reply.code(400).send({ error: 'No slug found in request.'});
	}
	let userId = 0; 
	const req = await getUserIdFromSlug(slug);
	if (!req.ok) {
		console.error("❌ Unable to get userId from slug (" + slug + ")");
		return reply.code(404).send({ error: "Requested user not found."});
	} else {
		userId = req.userId;
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting tournaments: database connection not found.');
		return reply.code(500).send({ error: 'Internal server error.'});
	}

	try {
		// console.debug("Trying to find tournaments with userId " + userId);
		let tournaments = db.getTournamentsForUserId(userId);
		if (!tournaments || tournaments.length === 0) {
			return reply.code(200).send([]);
		}
		console.log(`Found ${tournaments.length} tournaments for user ${userId}`);
		// console.debug(tournaments); // To show the found data

		let idsDict = new Map();
		for (let tournament of tournaments) {
			if (tournament.created_by) {
				const creatorId = Number(tournament.created_by);
				if (idsDict.has(creatorId) === true) {
					tournament.created_by = `@${idsDict.get(creatorId)}`;
				} else {
					const creatorName = await getUserInfoFromId(creatorId);
					if (!creatorName.ok || !creatorName.infos || !creatorName.infos.slug || creatorName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", creatorId);
						tournament.created_by = `@PlayerNotFound`;
					} else {
						idsDict.set(creatorId, creatorName.infos.slug);
						tournament.created_by = `@${idsDict.get(creatorId)}`;
					}
				}
			}
			if (tournament.winner && tournament.winner[0] === '@') {
				const winnerId = Number(tournament.winner.slice(1));
				if (idsDict.has(winnerId) === true) {
					tournament.winner = `@${idsDict.get(winnerId)}`;
				} else {
					const winnerName = await getUserInfoFromId(winnerId);
					if (!winnerName.ok || !winnerName.infos || !winnerName.infos.slug || winnerName.infos.slug == undefined) {
						console.error("❌ Player slug not found: ", winnerId);
						tournament.winner = `@PlayerNotFound`;
					} else {
						idsDict.set(winnerId, winnerName.infos.slug);
						tournament.winner = `@${idsDict.get(winnerId)}`;
					}
				}
			}
		}
		return reply.code(200).send(tournaments);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.error(error);
		return reply.code(500).send({error: 'Internal server error.'});
	}
}

// Gives the list of matches linked to a tournament
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentMatches(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.code(400).send({ error: 'No tournamentId found in request.'});
	}
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting matches: database connection not found');
		return reply.code(500).send({ error: 'Internal server error.'});
	}

	try {
		// console.debug("Trying to find tournaments with tournamentId " + tournamentId);
		let matches = db.getMatchesForTournamentId(tournamentId);
		if (!matches || matches.length === 0) {
			return reply.code(404).send({ error : 'No tournament found.'});
		}
		console.log(`Found ${matches.length} matches for id ${tournamentId}`);
		// console.log(matches);

		for (let i = 0; i < matches.length; i++) {
			const match = matches[i];
			const creatorName = await getUserInfoFromId(match.created_by);
			// console.debug(player1Name);
			// console.debug(player1Name.infos);
			if (!creatorName.ok) {
				console.error("❌ Player not found: ", player1Id);
				match.created_by = `@PlayerNotFound`;
			}
			else {
				match.created_by = `@${creatorName.infos.slug}`;
				// console.debug(`Replaced @${player1Id} with ${matches[i].player_a}`);
			}
			if (match.winner && match.winner[0] === '@') {
				const winnerId = match.winner.slice(1);
				const winnerName = await getUserInfoFromId(winnerId);
				// console.debug(winnerId);
				// console.debug(winnerName.infos);
				if (!winnerName.ok) {
					console.error("❌ Player not found: ", winnerId);
					match.winner = `@PlayerNotFound`;
				} else {
					match.winner = `@${winnerName.infos.slug}`;
					// console.debug(`Replaced @${winnerId} with ${matches[i].winner}`);
				}
			}
			if (match.player_a[0] === '@') {
				const player1Id = match.player_a.slice(1);
				const player1Name = await getUserInfoFromId(player1Id);
				// console.debug(player1Name);
				// console.debug(player1Name.infos);
				if (!player1Name.ok) {
					console.error("❌ Player not found: ", player1Id);
					matches[i].player_a = `@PlayerNotFound`;
				}
				else {
					matches[i].player_a = `@${player1Name.infos.slug}`;
					// console.debug(`Replaced @${player1Id} with ${matches[i].player_a}`);
				}
			}
			if (match.player_b[0] === '@') {
				const player2Id = match.player_b.slice(1);
				const player2Name = await getUserInfoFromId(player2Id);
				// console.debug(player2Name);
				// console.debug(player2Name.infos);
				if (!player2Name.ok) {
					console.error("❌ Player not found: ", player2Id);
					matches[i].player_b = `@PlayerNotFound`;
				} else {
					matches[i].player_b = `@${player2Name.infos.slug}`;
					// console.debug(`Replaced @${player2Id} with ${matches[i].player_b}`);
				}
			}
		}
;
		// console.debug(matches);
		return reply.code(200).send(matches);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.error(error);
		return reply.code(500).send({error: 'Internal server error.'});
	}
}

// Gives infos about the next match from a tournament
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentNextMatch(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId/next-match');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.code(400).send({ error: 'Missing input.'});
	}
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting tournament next match: database connection not found');
		return reply.code(500).send({ error: 'Internal server error.'});
	}

	try {
		// console.debug("Trying to find next match from tournamentId " + tournamentId);
		const match = db.getNextMatchForTournamentId(tournamentId);
		if (!match) {
			console.log("No next match found.");
			return reply.code(404).send({error: 'No next match found for this tournament.'});
		}
		console.log("Next match found: match " + match.game_id);
		// console.debug(match); // To show the found data

		if (match) {
			for (let i = 0; i < match.players.length; i++) {
				const player = match.players[i];
				if (player[0] === '@') {
					const playerId = player.slice(1);
					// console.debug("Resolving slug for id ", playerId);
					const playerName = await getUserInfoFromId(playerId);
					// console.debug(playerName);
					// console.debug(playerName.infos);
					if (!playerName.ok) {
						console.error("❌ Player not found: ", player);
						match.players[i] = `@PlayerNotFound`;
					}
					else {
						match.players[i] = `@${playerName.infos.slug}`;
					}
				}
			}
		}
		// console.debug("SENDING RESULT FOR THE MATCH :");
		// console.debug(match);
		return reply.code(200).send(match);
	}
	catch (error) {
		console.error('❌ Error fetching tournament next match:');
		console.error(error);
		return reply.code(500).send({error: 'Internal server error.'});
	}
}

