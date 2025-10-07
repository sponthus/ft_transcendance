import { checkTournamentCreationFormat, checkPlayerFormat, checkIdFormat } from "../../tools/CheckFormat.js";
import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js";

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
	// Tests OK
    for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (checkPlayerFormat(player) === false) {
			return reply.status(400).send({ error: 'Bad player name format.'});
		}
		if (player[0] === '@') {
			// console.debug("Resolving slug ", player);
			const userId = await getUserIdFromSlug(player.slice(1));
			// console.debug(userId);
			if (!userId.ok || (userId.ok && userId.userId == undefined)) {
				console.error("❌ Player not found: ", player);
				return reply.status(404).send({ error: `Player ${player} not found.`});
			} else {
				players[i] = `@${userId.userId}`;
				// console.debug("Player ", player, " resolved to id ", players[i]);
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
		if (result.ok === false) {
			throw new Error(result.error);
		}
		for (let player of players) {
			// Send notification = Tournament invitation
			if (player[0] === '@') {
				const playerId = player.slice(1);
				if (Number(playerId) != requestingUserId) {
					// TODO = Implement sending notification to playerId
					console.log("Tournament invitation sent to ", player);
				}
				else 
					console.log("No invitation sent to tournament creator ", player);
			}
		}
		return reply.status(201).send(result);
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.status(500).send({ error: 'Internal server error while creating tournament.'});
    }
}

export async function acceptTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/accept');
	const userId = request.body.userId;
	const tournamentId = request.body.tournamentId;

	if (!userId || !tournamentId) {
		return reply.status(400).send({ error: 'Bad request - userId and tournamentId are required.'});
	}
	if (checkIdFormat(userId) === false) {
		return reply.status(400).send({ error: 'Bad userId format.'});
	}
	if (checkIdFormat(tournamentId) === false) {
		return reply.status(400).send({ error: 'Bad tournamentId format.'});
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while accepting tournament invitation: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		const result = await db.acceptTournamentInvitation(userId, tournamentId);
		if (result.ok === false) {
			return reply.status(500).send({ error: result.error });
		}
		const all_accepted = await db.checkAllPlayersAccepted(tournamentId);
		if (all_accepted.ok === true) {
			// Send notification = Tournament is ready to start
			// TODO = Implement me
			console.log("All players accepted for tournament ", tournamentId);
		}
		return reply.status(200).send({ message: 'Tournament invitation accepted.'});
	} catch (error) {
		console.log('❌ Error accepting tournament invitation : ');
		console.log(error);
		return reply.status(500).send({ error: 'Internal server error while accepting tournament invitation.'});
	}
}