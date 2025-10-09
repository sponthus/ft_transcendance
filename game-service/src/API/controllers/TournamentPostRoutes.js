import { checkTournamentCreationFormat, checkPlayerFormat, checkIdFormat } from "../../tools/CheckFormat.js";
import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js";
import { sendTournamentInvitation } from "../requests/SendTournamentInvitation.js";

// Create a new tournament
// Security : Road is protected to logged-in users and from SQLi
export async function createTournament(request, reply) {
    console.log('➡️ User accessed POST /tournament');

	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.code(401).send({ error: "Unauthorized."});
    
	if (checkTournamentCreationFormat(request) === false) {
		return reply.code(400).send({ error: 'Bad tournament creation format - expected : name, players[array of 4 or 8 unique names].'});
	}
    const { name, players, option } = request.body;
	let has_users_to_wait = false;
	// Tests OK
    for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (checkPlayerFormat(player) === false) {
			return reply.code(400).send({ error: 'Bad player name format.'});
		}
		if (player[0] === '@') {
			// console.debug("Resolving slug ", player);
			const userId = await getUserIdFromSlug(player.slice(1));
			// console.debug(userId);
			if (!userId.ok || (userId.ok && userId.userId == undefined)) {
				console.error("❌ Player not found: ", player);
				return reply.code(404).send({ error: `Player ${player} not found.`});
			} else {
				players[i] = `@${userId.userId}`;
				console.debug(`Comparing ${userId.userId} and ${requestingUserId}`);
				console.debug(`Types  ${typeof(userId.userId)} and ${typeof(requestingUserId)}`);
				if (Number(userId.userId) != requestingUserId) {
					// console.log("Players need to accept invitations");
					has_users_to_wait = true;
				}
				// console.debug("Player ", player, " resolved to id ", players[i]);
			}
		}
	}

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.code(500).send({ error: 'No database connection found.'});
	}

    console.log('userId = ' + requestingUserId + ' / name ' + name + ' / players ' + players);
    
    try {
		console.debug("Players = ", players);
		console.debug(players);
		if (players.length !== 4) {
			return reply.code(400).send({ error: 'A tournament must have 4 players.'});
		}
		const playersCopy = [...players];
		console.log(`Creating tournament with players ${playersCopy}, has_users_to_wait = ${has_users_to_wait}`);
        const result = await db.createTournament(name, requestingUserId, players, option, has_users_to_wait);
		if (result.ok === false) {
			throw new Error(result.error);
		}
		// console.debug("Tournament created with id ", result.tournament_id);
		// console.debug("Players: ", playersCopy);
		console.debug("Checking if invitations have to be sent to ", playersCopy);
		for (let player of playersCopy) {
			// Send notification = Tournament invitation
			if (player[0] === '@') {
				const playerId = player.slice(1);
				if (Number(playerId) != requestingUserId) {
					const notification = await sendTournamentInvitation(playerId, requestingUserId, result.tournament_id, result.name);
					if (!notification.ok) {
						console.error("❌ Unable to send tournament invitation to ", player);
						// TODO : Delete tournament ?
					}
					console.log("❓ Tournament invitation sent to ", player);
				}
				else 
					console.log("❓ No invitation sent to tournament creator ", player);
			}
		}
		return reply.code(201).send(result);
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.code(500).send({ error: 'Internal server error while creating tournament.'});
    }
}
