// Secure with JWT and user ownership, input protected VS SQLi
// Delete a game if it is pending and belongs to the requesting user
export async function deleteGame(request, reply) {
	console.log('➡️ User accessed DELETE /:gameId');

    const requestingUserId = request.user.idUser;
    
	let { gameId } = request.params;
    if (!gameId) {
        return reply.code(400).send({error: 'No gameId found in request.'});
    }
	gameId = parseInt(gameId, 10);

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.code(500).send({ error: 'Internal server error.'});
	}
	
	// console.debug("Requesting user = ", requestingUserId, " / Game = ", gameId);

    try {
        const gameToDelete = await db.getGame(gameId);
        if (!gameToDelete) {
			return reply.code(404).send({ error : 'No game found.'});
		}
        if (gameToDelete.status !== 'pending') {
            return reply.code(403).send({ error : 'Forbidden, game is not pending.' });
        }
		if (gameToDelete.id_user !== requestingUserId) {
			console.error("❌ Error because found user_id = ", gameToDelete.id_user);
			return reply.code(403).send({ error: "Forbidden, this is not your game."});
		}
        if (gameToDelete.tournament_id)
            return reply.code(403).send({ error: 'Forbidden, game is linked to a tournament.' });

        const result = db.deleteGame(gameId);
        return reply.code(200).send(result);
    } catch (error) {
        console.error('❌ Error deleting game: ');
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error.' });
    }
}
