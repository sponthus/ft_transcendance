import { checkTournamentCreationFormat, checkTournamentNameFormat, checkPlayerFormat, checkIdFormat } from "../../tools/CheckFormat.js";
import { sendTournamentReady } from "../requests/SendTournamentReady.js";
import { sendTournamentCancelation } from "../requests/SendTournamentCancelation.js";
import { getUserInfoFromId } from "../requests/GetUserInfoFromId.js";
import { sendTournamentAcceptation } from "../requests/SendTournamentAcceptation.js";

export async function acceptTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/accept');
	const acceptingUserId = request.body.acceptingUserId;
	const ownerUserId = request.body.ownerUserId;
	const tournamentName = request.body.tournamentName;
	const tournamentId = request.body.tournamentId;

	if (!acceptingUserId || !tournamentId) {
		return reply.code(400).send({ error: 'Bad request - acceptingUserId and tournamentId are required.'});
	}
	if (checkIdFormat(acceptingUserId) === false) {
		return reply.code(400).send({ error: 'Bad acceptingUserId format.'});
	}
	if (checkIdFormat(ownerUserId) === false) {
		return reply.code(400).send({ error: 'Bad ownerUserId format.'});
	}
	if (checkIdFormat(tournamentId) === false) {
		return reply.code(400).send({ error: 'Bad tournamentId format.'});
	}
	if (checkTournamentNameFormat(tournamentName) === false) {
		return reply.code(400).send({ error: 'Bad tournamentName format.'});
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while accepting tournament invitation: database connection not found');
		return reply.code(500).send({ error: 'Internal server error' });
	}

	try {
		const result = await db.acceptTournamentInvitation(acceptingUserId, tournamentId);
		if (result.ok === false) {
			console.log("❌ Unable to accept tournament invitation: ", result.error);
			switch (result.error) {
				case "not found":
					return reply.code(404).send({ error: result.error });
				case "Player already accepted invitation":
					return reply.code(409).send({ error: result.error });
				case "Player does not need to accept or refuse invitation":
					return reply.code(400).send({ error: result.error });
				case "Tournament is not in a state of invitations":
					return reply.code(400).send({ error: result.error });
				case "Player already accepted invitation, cannot go back":
					return reply.code(400).send({ error: result.error });
				case "Player already accepted or declined invitation":
					return reply.code(400).send({ error: result.error });
				default:
					// Unknown error
					return reply.code(500).send({ error: "Internal server error" });
			}
		} else {
			if (result.ready === true) {
				const players = result.playerIds;
				console.log("All players accepted for tournament ", tournamentId, " - Sending ready notifications to players ", players);

				// Acceptation notification to the user, cancel tournament if error + send notif
				const acceptNotification = await sendTournamentAcceptation(ownerUserId, acceptingUserId, tournamentId, tournamentName);
				if (acceptNotification.ok === false) {
					console.error("❌ Unable to send tournament acceptation notification to owner ", ownerUserId, ": ", acceptNotification.error);
					const cancelTournament = await db.cancelTournament(tournamentId);
						if (cancelTournament.ok === false) {
							console.error("❌ Unable to cancel tournament after failure to send acceptation notification: ", cancelTournament.error);
						} else {
							console.log("Tournament ", tournamentId, " cancelled after failure to send acceptation notification");
							// Send notification = Tournament is cancelled
							const cancelNotification = await sendTournamentCancelation(players, tournamentId, tournamentName);
							if (cancelNotification.ok === false) {
								console.error("❌ Unable to send tournament cancelation notification to players ", players, ": ", cancelNotification.error);
							} else {
								console.log("❓ Tournament cancelation notification sent to players ", players);
							}
							return reply.code(500).send({ error: 'Internal server error'});
						}
				} else {
					console.log("❓ Tournament acceptation notification sent to owner ", ownerUserId);
				}

				// Send notification = Tournament is ready to start
				for (let playerId of players) {
					const notification = await sendTournamentReady(playerId, ownerUserId, tournamentId, tournamentName);
					if (notification.ok === false) {
						console.error("❌ Unable to send tournament ready notification to player ", playerId, ": ", notification.error);
						const cancelTournament = await db.cancelTournament(tournamentId);
						if (cancelTournament.ok === false) {
							console.error("❌ Unable to cancel tournament after failure to send ready notification: ", cancelTournament.error);
						} else {
							console.log("Tournament ", tournamentId, " cancelled after failure to send ready notification");
							// Send notification = Tournament is cancelled
							const cancelNotification = await sendTournamentCancelation(players, tournamentId, tournamentName);
							if (cancelNotification.ok === false) {
								console.error("❌ Unable to send tournament cancelation notification to players ", players, ": ", cancelNotification.error);
							} else {
								console.log("❓ Tournament cancelation notification sent to players ", players);
							}
							return reply.code(500).send({ error: 'Internal server error'});
						}
					} else {
						console.log("❓ Tournament ready notification sent to player ", playerId);
					}
				}
				return reply.code(200).send({ message: 'Tournament invitation accepted. All players have accepted, tournament is ready to start.'});
			} else {
				return reply.code(200).send({ message: 'Tournament invitation accepted.'});
			}
		}
	} catch (error) {
		console.log('❌ Error accepting tournament invitation : ');
		console.log(error);
		return reply.code(500).send({ error: 'Internal server error'});
	}
}

// TODO test
export async function declineTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/decline');
	const userId = request.body.userId;
	const tournamentId = request.body.tournamentId;

	if (!userId || !tournamentId) {
		return reply.code(400).send({ error: 'Bad request - userId and tournamentId are required.'});
	}
	if (checkIdFormat(userId) === false) {
		return reply.code(400).send({ error: 'Bad userId format.'});
	}
	if (checkIdFormat(tournamentId) === false) {
		return reply.code(400).send({ error: 'Bad tournamentId format.'});
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while declining tournament invitation: database connection not found');
		return reply.code(500).send({ error: 'No database connection found.'});
	}

	try {
		const result = await db.declineTournamentInvitation(userId, tournamentId);
		if (result.ok === false) {
			console.error("❌ Unable to decline tournament invitation: ", result.error);
			switch (result.error) {
				case "Tournament not found":
					return reply.code(404).send({ error: result.error });
				case "Player not found in this tournament": 
					return reply.code(404).send({ error: result.error });
				case "Player does not need to accept or refuse invitation":
					return reply.code(400).send({ error: result.error });
				case "Tournament is not in a state of invitations":
					return reply.code(400).send({ error: result.error + " (" + result.state + ")" });
				case "Player already accepted invitation, cannot go back":
					return reply.code(400).send({ error: result.error });
				case "Player already accepted or declined invitation":
					return reply.code(400).send({ error: result.error });
				default: // Unknown error
					return reply.code(500).send({ error: result.error });
			}
		} else {
			console.log("Player ", userId, " declined tournament ", tournamentId, " - Tournament cancelled");
			// Send notification = Tournament is cancelled
			const players = result.playersToNotify;
			return reply.code(200).send({ message: 'Tournament invitation declined and tournament cancelled.'});
		}
		// Send notification = Tournament is cancelled
		// TODO = Implement me
	} catch (error) {
		console.error('❌ Error declining tournament invitation : ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error while declining tournament invitation.'});
	}
}