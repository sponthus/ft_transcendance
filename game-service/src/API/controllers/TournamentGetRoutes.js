import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"

// Gives the list of tournaments linked to a player
// Security : Road is protected to logged-in users
export async function getTournamentsForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/tournaments');

	const { slug } = request.params;
	if (!slug) {
		return reply.status(400).send({ error: 'No slug found in request.'});
	}

	let userId = 0; 
	const req = await getUserIdFromSlug(slug);
	if (!req.ok) {
		console.log("❌ Unable to get userId from slug");
		return reply.status(500).send({ error: "Unable to get userId"});
	} else {
		userId = req.userId;
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while getting tournaments: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		console.log("Trying to find tournaments with userId " + userId);
		const tournaments = db.getTournamentsForUserId(userId);
		if (!tournaments || tournaments.length === 0) {
			return reply.status(200).send([]);
		}
		console.log(`Found ${tournaments.length} tournaments for user ${userId}`);
		// console.log(tournaments);
		return reply.status(200).send(tournaments);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournaments'});
	}
}

// Gives the list of matches linked to a tournament
// Security : Road is protected to logged-in users
export async function getTournamentMatches(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.status(400).send({ error: 'No tournamentId found in request.'});
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
			return reply.status(200).send([]);
		}
		console.log(`Found ${matches.length} matches for id ${tournamentId}`);
		console.log(matches);
		return reply.status(200).send(matches);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournaments'});
	}
}

// Gives infos about the next match from a tournament
export async function getTournamentNextMatch(request, reply) {
	console.log('➡️ User accessed GET /:tournamentId/next-match');

	const { tournamentId } = request.params;
	if (!tournamentId) {
		return reply.status(400).send({ error: 'No tournamentId found in request.'});
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
			return reply.status(404).send([]);
		}
		console.log(match);
		return reply.status(200).send(match);
	}
	catch (error) {
		console.error('❌ Error fetching tournament next match:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournament next match'});
	}
}

