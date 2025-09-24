import { checkTournamentCreationFormat, checkUsernameFormat } from "../../tools/CheckFormat.js";

// Create a new tournament
// Security : Road is protected to logged-in users and from SQLi
export async function createTournament(request, reply) {
    console.log('➡️ User accessed POST /tournament');

	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized."});
    
	if (checkTournamentCreationFormat(request) === false) {
		return reply.status(400).send({ error: 'Bad tournament creation format - expected : name, players[array of 4 or 8 unique names].'});
	}
    const { name, players } = request.body;
    for (const player of players) {
		if (checkUsernameFormat(player) === false) {
			return reply.status(400).send({ error: 'Bad player name format.'});
		}
	}

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

    console.log('userId = ' + requestingUserId + ' / name ' + name + ' / players ' + players);
    
    try {
        const result = await db.createTournament(name, requestingUserId, players);
        return reply.status(201).send(result);
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.status(500).send({ error: 'Internal server error while creating tournament.'});
    }
}