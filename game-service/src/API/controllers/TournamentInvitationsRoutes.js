import { sendTournamentReady } from "../requests/SendTournamentReady.js";
import { sendTournamentCancelation } from "../requests/SendTournamentCancelation.js";
import { sendTournamentAcceptation } from "../requests/SendTournamentAcceptation.js";

// Security : Accessible to internal services
export async function acceptTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/accept');
	// console.debug(request.body);
	const acceptingUserId = request.body.userId;
	const ownerUserId = request.body.ownerUserId;
	const tournamentName = request.body.tournamentName;
	const tournamentId = request.body.tournamentId;

	// console.debug('Body:', request.body);
	if (!acceptingUserId || !tournamentId) {
		return reply.code(400).send({ error: 'Bad request - userId and tournamentId are required.' });
	}
	// console.debug("Accepting user ", acceptingUserId, " for tournament ", tournamentId);

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while accepting tournament invitation: database connection not found');
		return reply.code(500).send({ error: 'Internal server error' });
	}

	try {
		const result = await db.acceptTournamentInvitation(acceptingUserId, tournamentId);
		// console.debug(result);
		if (result.ok === false) {
			console.warn(`❌ Unable to accept tournament invitation: /${result.error}/`);
			switch (result.error) {
				case "Player not found in this tournament":
					return reply.code(404).send({ error: result.error });
				case "Tournament not found":
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
					return reply.code(500).send({ error: result.error || "Internal server error" });
			}
		}

		const players = result.playerIds;
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
				const cancelNotification = await sendTournamentCancelation(ownerUserId, players, tournamentId, tournamentName);
				if (cancelNotification.ok === false) {
					console.error("❌ Unable to send tournament cancelation notification to players ", players, ": ", cancelNotification.error);
				} else {
					console.log("❓ Tournament cancelation notification sent to players ", players);
				}
				return reply.code(acceptNotification.code || 500).send({ error: acceptNotification.error || "Internal server error" });
			}
		} else {
			console.log("❓ Tournament acceptation notification sent to owner ", ownerUserId);
		}
		if (result.ready === true) {
			const players = result.playerIds;
			console.log("All players accepted for tournament ", tournamentId, " - Sending ready notifications to players ", players);

			// Send notification = Tournament is ready to start
			const notification = await sendTournamentReady(players, ownerUserId, tournamentId, tournamentName);
			if (notification.ok === false) {
				console.error("❌ Unable to send tournament ready notification to players ", players, ": ", notification.error);
				const cancelTournament = await db.cancelTournament(tournamentId);
				if (cancelTournament.ok === false) {
					console.error("❌ Unable to cancel tournament after failure to send ready notification: ", cancelTournament.error);
				} else {
					console.log("Tournament ", tournamentId, " cancelled after failure to send ready notification");
					// Send notification = Tournament is cancelled
					const cancelNotification = await sendTournamentCancelation(ownerUserId, players, tournamentId, tournamentName);
					if (cancelNotification.ok === false) {
						console.error("❌ Unable to send tournament cancelation notification to players ", players, ": ", cancelNotification.error);
					} else {
						console.log("❓ Tournament cancelation notification sent to players ", players);
					}
					return reply.code(notification.code || 500).send({ error: notification.error || 'Internal server error' });
				}
			} else {
				console.log("❓ Tournament ready notification sent to players ", players);
			}
			return reply.code(200).send({ message: 'Tournament invitation accepted. All players have accepted, tournament is ready to start.' });
		} else {
			return reply.code(200).send({ message: 'Tournament invitation accepted.' });
		}
	} catch (error) {
		console.error('❌ Error accepting tournament invitation : ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
}

// Security : Accessible to internal services
export async function declineTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/decline');
	const ownerUserId = request.body.ownerUserId;
	const tournamentId = request.body.tournamentId;
	const tournamentName = request.body.tournamentName;
	const refusingUserId = request.body.userId;

	if (!refusingUserId || !tournamentId || !tournamentName || !ownerUserId) {
		return reply.code(400).send({ error: 'Bad request, missing arguments.' });
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while declining tournament invitation: database connection not found');
		return reply.code(500).send({ error: 'Internal server error' });
	}

	try {
		const result = await db.declineTournamentInvitation(refusingUserId, tournamentId);
		if (result.ok === false) {
			console.error(`❌ Unable to decline tournament invitation: /${result.error}/ - /${result.message}`);
			switch (result.error) {
				case "Tournament not found":
					return reply.code(404).send({ error: result.error });
				case "Player not found in this tournament":
					return reply.code(404).send({ error: result.error });
				case "Player does not need to accept or refuse invitation":
					return reply.code(400).send({ error: result.error });
				case "Tournament is not in a state of invitations":
					return reply.code(400).send({ error: result.error });
				case "Player already accepted invitation, cannot go back":
					return reply.code(400).send({ error: result.error });
				case "Player already accepted or declined invitation":
					return reply.code(400).send({ error: result.error });
				default: // Unknown error
					return reply.code(500).send({ error: result.error });
			}
		} else {
			console.log("Player ", refusingUserId, " declined tournament ", tournamentId, " - Tournament cancelled");
			// Send notification = Tournament is cancelled
			const players = result.playersToNotify;
			const cancelNotification = await sendTournamentCancelation(ownerUserId, players, tournamentId, tournamentName);
			if (cancelNotification.ok === false) {
				console.error("❌ Unable to send tournament cancelation notification to players ", players, ": ", cancelNotification.error);
				// Not blocking, tournament is cancelled anyway
			} else {
				console.log("❓ Tournament cancelation notification sent to players ", players);
			}
			return reply.code(200).send({ message: 'Tournament invitation declined and tournament cancelled.' });
		}
	} catch (error) {
		console.error('❌ Error declining tournament invitation : ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
}
