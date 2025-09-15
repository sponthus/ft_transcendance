// Tests ok
export async function deleteGame(request, reply) {
	console.log('➡️ User accessed DELETE /:gameId');

    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized"});
    
	const { gameId } = request.params;
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}
	
	console.log("Requesting user = ", requestingUserId, " / Game = ", gameId);

    try {
        const gameToDelete = await db.getGame(gameId);
        if (!gameToDelete) {
			return reply.status(404).send({ error : 'No game found'});
		}
        if (gameToDelete.status !== 'pending') {
            return reply.status(401).send({ error : 'Game is not pending' });
        }
		if (gameToDelete.id_user !== requestingUserId) {
			// console.log("Error because found user_id = ", gamesToDelete[0].user_id);
			return reply.status(401).send({ error: "Unauthorized: this is not your game"});
		}
        if (gameToDelete.tournament_id)
            return reply.status(401).send({ error: 'Game is linked to a tournament' });

        const result = db.deleteGame(gameId);
        return reply.status(200).send(result);
    } catch (error) {
        console.error('❌ Error deleting game: ');
		console.log(error);
		return reply.status(500);
    }
}
