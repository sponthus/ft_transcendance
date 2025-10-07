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
		console.log("Trying to find tournaments with userId " + userId);
		const tournaments = db.getTournamentsForUserId(userId);
		if (!tournaments || tournaments.length === 0) {
			return reply.status(200).send([]);
		}
		console.log(`Found ${tournaments.length} tournaments for user ${userId}`);
		console.log(tournaments); // To show the found data
		if (tournaments[0].winner[0] === '@') {
			const winnerId = tournaments[0].winner.slice(1);
			const winnerName = await getUserInfoFromId(winnerId);
			if (winnerName.ok) {
				tournaments[0].winner = `@${winnerName.nickname}`;
			} // TODO check me
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
		console.log(matches); // To show the found data
		// TODO test me
		for (let i = 0; i < matches.length; i++) {
			const match = matches[i];
			if (match.player_a[0] === '@') {
				const player1Id = match.player_a.slice(1);
				const player1Name = await getUserInfoFromId(player1Id);
				if (player1Name.ok) {
					matches[i].player_a = `@${player1Name.nickname}`;
				}
			}
			if (match.player_b[0] === '@') {
				const player2Id = match.player_b.slice(1);
				const player2Name = await getUserInfoFromId(player2Id);
				if (player2Name.ok) {
					matches[i].player_b = `@${player2Name.nickname}`;
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
		console.log("Next match found: match " + match.id_match);
		console.log(match); // To show the found data
		// TODO test me
		if (match.player_a[0] === '@') {
			const player1Id = match.player_a.slice(1);
			const player1Name = await getUserInfoFromId(player1Id);
			if (player1Name.ok) {
				match.player_a = `@${player1Name.nickname}`;
			}
		}
		if (match.player_b[0] === '@') {
			const player2Id = match.player_b.slice(1);
			const player2Name = await getUserInfoFromId(player2Id);
			if (player2Name.ok) {
				match.player_b = `@${player2Name.nickname}`;
			}
		}
		return reply.status(200).send(match);
	}
	catch (error) {
		console.error('❌ Error fetching tournament next match:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournament next match.'});
	}
}

