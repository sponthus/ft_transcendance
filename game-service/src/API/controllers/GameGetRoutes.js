// Gives the full history of a user
// Security : Road is protected to logged-in users
export async function getGamesForUserId(request, reply) {
	console.log('➡️ User accessed GET /:userId/games');

	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized"});

	const { userId } = request.params;
	if (!userId) {
		return reply.status(400).send({ error: 'No userId found in request.'});
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
		console.log(`Found ${games.length} games for user ${userId}`);
		return reply.status(200).send(games);
	}
	catch (error) {
		console.error('❌ Error fetching games:');
		console.log(error);
		return reply.status(500).send({error: 'Internal server error while fetching games'});
	}
}