export async function deleteTournament(request, reply) {
	console.log('➡️ User accessed DELETE /tournament/:gameId');

    const requestingUserId = request.user.idUser;
	
	const { tournamentId } = request.params;
    if (!tournamentId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting tournament: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}
	
	console.log("Requesting user = ", requestingUserId, " / Tournament = ", tournamentId);

    try {
        const tournamentToDelete = await db.getTournament(tournamentId);
        if (!tournamentToDelete) {
			return reply.status(404).send({ error : 'No tournament found'});
		}
		console.log(tournamentToDelete);
		console.log("Status to check:", tournamentToDelete.status, typeof tournamentToDelete.status);
        if (tournamentToDelete.status !== 'pending') {
			if (tournamentToDelete.status === 'between-games' ) {
				const result = db.updateTournamentStatus(tournamentId, 'canceled');
				return reply.status(200).send({
					action: "canceled",
					name: tournamentToDelete.name
				});
			}
            return reply.status(403).send({ error : 'Forbidden, tournament is not pending' });
        }
		if (tournamentToDelete.id_user !== requestingUserId) {
			// console.log("Error because found user_id = ", tournamentsToDelete[0].user_id);
			return reply.status(403).send({ error: "Forbidden, this is not your tournament"});
		}

        const result = db.deleteTournament(tournamentId);
        return reply.status(200).send({
			action: "deleted",
			name: tournamentToDelete.name
		});
    } catch (error) {
        console.error('❌ Error deleting tournament: ');
		console.log(error);
		return reply.status(500);
    }
}
