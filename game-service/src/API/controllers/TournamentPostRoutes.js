import { checkTournamentCreationFormat, checkPlayerFormat, checkIdFormat } from "../../tools/CheckFormat.js";
import { getUserIdFromSlug } from "../requests/GetUserIdFromSlug.js";
import { sendTournamentInvitation } from "../requests/SendTournamentInvitation.js";

function checkDoubles(arr) {
	const uniqueItems = new Set(arr);
	return uniqueItems.size !== arr.length;
}

// Create a new tournament
// Security : Road is protected to logged-in users and from SQLi
export async function createTournament(request, reply) {
    console.log('➡️ User accessed POST /tournament');

	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.code(401).send({ error: "Unauthorized."});
    
	if (checkTournamentCreationFormat(request) === false) {
		return reply.code(400).send({ error: 'Bad tournament creation format.'});
	}
    const { name, players, option } = request.body;
	if (checkDoubles(request.body.players) === true) {
		return reply.code(400).send({ error: 'Duplicates not allowed.'});
	}
	if (players.length !== 4) {
		return reply.code(400).send({ error: 'A tournament must have 4 players.'});
	}
	let has_users_to_wait = false;
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
				// console.debug(`Comparing ${userId.userId} and ${requestingUserId}`);
				// console.debug(`Types  ${typeof(userId.userId)} and ${typeof(requestingUserId)}`);
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

    // console.debug('userId = ' + requestingUserId + ' / name ' + name + ' / players ' + players);
    
    try {
		// console.debug("Players = ", players);
		// console.debug(players);
		const playersCopy = [...players];
        const result = await db.createTournament(name, requestingUserId, players, option, has_users_to_wait);
		if (result.ok === false) {
			throw new Error(result.error);
		}
		console.log(`Created tournament with players ${playersCopy}, has_users_to_wait = ${has_users_to_wait}`);
		// console.debug("Tournament created with id ", result.tournament_id);
		// console.debug("Players: ", playersCopy);
		// console.debug("Checking if invitations have to be sent to ", playersCopy);
		for (let player of playersCopy) {
			// Send notification = Tournament invitation
			if (player[0] === '@') {
				const playerId = player.slice(1);
				if (Number(playerId) != requestingUserId) {
					const notification = await sendTournamentInvitation(playerId, requestingUserId, result.tournament_id, result.name);
					if (!notification.ok) {
						console.error("❌ Unable to send tournament invitation to ", player);
						const cancelTournament = await db.cancelTournament(result.tournament_id);
						if (cancelTournament.ok === false) {
							console.error("❌ Unable to cancel tournament after failure to send invitation: ", cancelTournament.error);
						} else {
							console.log("Tournament ", result.tournament_id, " cancelled after failure to send invitation");
							return reply.code(503).send({ error: 'Unable to send all invitations, tournament cancelled.'});
						}
					}
					else
						console.log("❓ Tournament invitation sent to ", player);
				}
				else 
					console.log("❓ No invitation sent to tournament creator ", player);
			}
		}
		if (has_users_to_wait === false) {
			return reply.code(200).send(result);
		} else {
			return reply.code(201).send(result);
		}
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.code(500).send({ error: 'Internal server error.'});
    }
}
