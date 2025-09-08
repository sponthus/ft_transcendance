// Gives the list of tournaments linked to a player
// Security : Road is protected to logged-in users
export async function getTournamentsForUserId(request, reply) {
	console.log('➡️ User accessed GET /:userId/tournaments');

	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized"});

	const { userId } = request.params;
	if (!userId) {
		return reply.status(400).send({ error: 'No userId found in request.'});
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
		console.log(tournaments);
		return reply.status(200).send(tournaments);
	}
	catch (error) {
		console.error('❌ Error fetching tournaments:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching tournaments'});
	}
}