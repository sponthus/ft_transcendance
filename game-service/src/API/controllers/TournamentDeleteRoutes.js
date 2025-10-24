import { sendTournamentCancelation } from '../requests/SendTournamentCancelation.js';

// Tests ok
// Secure with JWT, input protected VS SQLi
// Delete a tournament if it is pending and belongs to the requesting user
export async function deleteTournament(request, reply) {
	console.log('➡️ User accessed DELETE /tournament/:gameId');

	const { tournamentId } = request.params;
    if (!tournamentId) {
        return reply.code(400).send({error: 'No tournamentId found in request.'});
    }
    
	const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting tournament: database connection not found');
		return reply.code(500).send({ error: 'Internal server error.'});
	}
	
	// console.debug("Requesting user = ", requestingUserId, " / Tournament = ", tournamentId);

    try {
        const tournamentToDelete = await db.getTournament(tournamentId);
        if (!tournamentToDelete) {
			return reply.code(404).send({ error : 'No tournament found.'});
		}
		// console.debug(tournamentToDelete);
		// console.debug("Status to check:", tournamentToDelete.status, typeof tournamentToDelete.status);
        if (tournamentToDelete.status !== 'pending' && tournamentToDelete.status !== 'invitations') {
			if (tournamentToDelete.status === 'between_games' ) {
				const result = db.updateTournamentStatus(tournamentId, 'canceled');
				if (result.ok) {
					return reply.code(200).send({
						action: "canceled",
						name: tournamentToDelete.name
					});
				} else {
					return reply.code(500).send({ error: '❌ Internal server error while canceling tournament.' });
				}
			}
            return reply.code(403).send({ error : 'Forbidden, tournament is not pending.' });
        }

        db.deleteTournament(tournamentId);

		const players = tournamentToDelete.players;
		// console.debug("players = ", players);
		const notif = sendTournamentCancelation(requestingUserId, players, tournamentToDelete.name, tournamentId);
		if (notif.ok === false) {
			console.error("❌ Error while sending cancelation notifications: ", notif.error);
			// Non blocking, tournament has been deleted anyway
		} else {
			console.log("❓ Tournament cancelation notification sent to players ", players);
		}

        return reply.code(200).send({
			action: "deleted",
			name: tournamentToDelete.name
		});
    } catch (error) {
        console.error('❌ Error deleting tournament: ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error.' });
    }
}
