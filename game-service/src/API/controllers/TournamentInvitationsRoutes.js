import { checkTournamentCreationFormat, checkPlayerFormat, checkIdFormat } from "../../tools/CheckFormat.js";

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
			// Player not found with this ID
			return reply.status(404).send({ error: result.error });
		}
		else if (result.ok === true && result.error) {
			// Player had already accepted, TODO doesn't work
			return reply.status(409).send({ message: 'Tournament invitation already accepted.'});
		}
		const all_accepted = await db.checkAllPlayersAccepted(tournamentId);
		if (all_accepted.ok === true) {
			const updateStatus = await db.updateTournamentStatus(tournamentId, "pending");
			if (updateStatus.ok === false) {
				console.error("❌ Unable to update tournament status to pending: ", updateStatus.error);
				return reply.status(500).send({ error: 'Internal server error while updating tournament status.'});
			}
			// Send notification = Tournament is ready to start
			// TODO = Implement me
			console.log("All players accepted for tournament ", tournamentId);
			return reply.status(200).send({ message: 'Tournament invitation accepted. All players have accepted, tournament is ready to start.'});
		}
		return reply.status(200).send({ message: 'Tournament invitation accepted.'});
	} catch (error) {
		console.log('❌ Error accepting tournament invitation : ');
		console.log(error);
		return reply.status(500).send({ error: 'Internal server error while accepting tournament invitation.'});
	}
}

// TODO test
export async function declineTournamentInvitation(request, reply) {
	console.log('➡️ User accessed POST /tournament/decline');
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
		console.error('❌ Error while declining tournament invitation: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	try {
		const result = await db.declineTournamentInvitation(userId, tournamentId);
		if (result.ok === false) {
			console.error("❌ Unable to decline tournament invitation: ", result.error);
			// Player not found with this ID
			return reply.status(404).send({ error: result.error });
		}
		// Send notification = Tournament is cancelled
		// TODO = Implement me
		console.log("Player ", userId, " declined tournament ", tournamentId, " - Tournament cancelled");
		return reply.status(200).send({ message: 'Tournament invitation declined and tournament cancelled.'});
	} catch (error) {
		console.error('❌ Error declining tournament invitation : ');
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error while declining tournament invitation.'});
	}
}