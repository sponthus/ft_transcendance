import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js"

// Gives the full history of a user
// Security : Road is protected to logged-in users
export async function getGamesForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug/games');

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
		console.log("Got userId :", userId);
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