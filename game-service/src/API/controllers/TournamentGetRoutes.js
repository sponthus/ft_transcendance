import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"
import { getUserInfoFromId } from "../requests/GetUserInfoFromId.js"
import { checkIdFormat, checkSlugFormat } from "../../tools/CheckFormat.js"

// Gives the list of tournaments linked to a player
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentsForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/tournaments');

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
		console.log("❌ Unable to get userId from slug (" + slug + ")");
		return reply.status(404).send({ error: "Requested user not found."});
	} else {
		userId = req.userId;
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting tournaments: database connection not found.');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		// console.debug("Trying to find tournaments with userId " + userId);
		const tournaments = db.getTournamentsForUserId(userId);
		if (!tournaments || tournaments.length === 0) {
			return reply.status(200).send([]);
		}
		console.log(`Found ${tournaments.length} tournaments for user ${userId}`);
		// console.debug(tournaments); // To show the found data
		if (tournaments[0].winner && tournaments[0].winner[0] === '@') {
			const winnerId = tournaments[0].winner.slice(1);
			const winnerName = await getUserInfoFromId(winnerId);
			if (!winnerName.ok || !winnerName.infos || !winnerName.infos.nickname || winnerName.infos.nickname == undefined) {
				console.error("❌ Player nickname not found: ", winnerId);
				return reply.status(404).send({ error: `Player not found.`});
			} else {
				tournaments[0].winner = `@${winnerName.infos.nickname}`;
			}
		}
		return reply.status(200).send(tournaments);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournaments.'});
	}
}

// Gives the list of matches linked to a tournament
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentMatches(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.status(400).send({ error: 'No tournamentId found in request.'});
	}
	if (checkIdFormat(tournamentId) === false) {
		return reply.status(400).send({ error: 'Bad tournamentId format.'});
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting matches: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		console.log("Trying to find tournaments with tournamentId " + tournamentId);
		const matches = db.getMatchesForTournamentId(tournamentId);
		if (!matches || matches.length === 0) {
			return reply.status(404).send({ error : 'No tournament found.'});
		}
		console.log(`Found ${matches.length} matches for id ${tournamentId}`);
		// console.log(matches); // To show the found data
		// Tests OK
		for (let i = 0; i < matches.length; i++) {
			const match = matches[i];
			if (match.player_a[0] === '@') {
				const player1Id = match.player_a.slice(1);
				const player1Name = await getUserInfoFromId(player1Id);
				// console.debug(player1Name);
				// console.debug(player1Name.infos);
				if (!player1Name.ok) {
					console.error("❌ Player not found: ", player1Id);
					return reply.status(404).send({ error: "User in match not found" });
				}
				else {
					matches[i].player_a = `@${player1Name.infos.nickname}`;
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
					return reply.status(404).send({ error: "User in match not found" });
				} else {
					matches[i].player_b = `@${player2Name.infos.nickname}`;
					// console.debug(`Replaced @${player2Id} with ${matches[i].player_b}`);
				}
			}
		}
		return reply.status(200).send(matches);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournaments'});
	}
}

// Gives infos about the next match from a tournament
// Security : Road is protected to logged-in users and from SQLi
export async function getTournamentNextMatch(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId/next-match');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.status(400).send({ error: 'Missing input.'});
	}
	if (checkIdFormat(tournamentId) === false) {
		return reply.status(400).send({ error: 'Bad tournamentId format.'});
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting tournament next match: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		console.log("Trying to find next match from tournamentId " + tournamentId);
		const match = db.getNextMatchForTournamentId(tournamentId);
		if (!match) {
			console.log("No next match found.");
			return reply.status(404).send({error: 'No next match found for this tournament.'});
		}
		console.log("Next match found: match " + match.game_id);
		// console.debug(match); // To show the found data
		// Test is ok
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
						return reply.status(500).send({ error: "User not found" });
					}
					else {
						match.players[i] = `@${playerName.infos.nickname}`;
					}
				}
			}
		}
		// console.debug("SENDING RESULT FOR THE MATCH :");
		// console.debug(match);
		return reply.status(200).send(match);
	}
	catch (error) {
		console.error('❌ Error fetching tournament next match:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournament next match.'});
	}
}

