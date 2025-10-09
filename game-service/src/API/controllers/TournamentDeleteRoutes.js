import { checkIdFormat } from '../../tools/CheckFormat.js';

// Tests ok
// Secure with JWT, input protected VS SQLi
// Delete a tournament if it is pending and belongs to the requesting user
export async function deleteTournament(request, reply) {
	console.log('➡️ User accessed DELETE /tournament/:gameId');

    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.code(401).send({ error: "Unauthorized."});

	const { tournamentId } = request.params;
    if (!tournamentId) {
        return reply.code(400).send({error: 'No tournamentId found in request.'});
    }
	if (checkIdFormat(tournamentId) === false) {
		return reply.code(400).send({ error: 'Bad gameId format.'});
	}

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting tournament: database connection not found');
		return reply.code(500).send({ error: 'No database connection found.'});
	}
	
	console.log("Requesting user = ", requestingUserId, " / Tournament = ", tournamentId);

    try {
        const tournamentToDelete = await db.getTournament(tournamentId);
        if (!tournamentToDelete) {
			return reply.code(404).send({ error : 'No tournament found.'});
		}
		console.log(tournamentToDelete);
		console.log("Status to check:", tournamentToDelete.status, typeof tournamentToDelete.status);
        if (tournamentToDelete.status !== 'pending') {
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
		if (tournamentToDelete.id_user !== requestingUserId) {
			console.error("❌ Error because found user_id = ", tournamentToDelete.id_user, " VS Request = ", requestingUserId);
			return reply.code(403).send({ error: "Forbidden, this is not your tournament."});
		}

        db.deleteTournament(tournamentId);
        return reply.code(200).send({
			action: "deleted",
			name: tournamentToDelete.name
		});
    } catch (error) {
        console.error('❌ Error deleting tournament: ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error while deleting tournament.' });
    }
}
