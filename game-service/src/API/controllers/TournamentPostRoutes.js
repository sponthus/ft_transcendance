import { checkTournamentCreationFormat, checkPlayerFormat } from "../../tools/CheckFormat.js";

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
	// TODO test me
    for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (checkPlayerFormat(player) === false) {
			return reply.status(400).send({ error: 'Bad player name format.'});
		}
		if (player[0] === '@') {
			const userId = await getUserIdBySlug(player.slice(1));
			if (!userId) {
				return reply.status(400).send({ error: `Player ${player} not found.`});
			} else {
				players[i] = `@${userId}`;
			}
		}
	}

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

    console.log('userId = ' + requestingUserId + ' / name ' + name + ' / players ' + players);
    
    try {
		if (players.length !== 4) {
			return reply.status(400).send({ error: 'A tournament must have 4 players.'});
		}
        const result = await db.createTournament(name, requestingUserId, players);
        return reply.status(201).send(result);
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.status(500).send({ error: 'Internal server error while creating tournament.'});
    }
}