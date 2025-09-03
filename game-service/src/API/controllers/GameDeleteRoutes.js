// Tests ok normal case
export async function deleteGame(request, reply) {
	console.log('➡️ User accessed DELETE /:gameId');

    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized"});
	const { gameId } = request.params;
    const { db } = request.server;
	
	console.log("Requesting user = ", requestingUserId, " / Game = ", gameId);
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
        return reply.status(500).send({error: 'No database connection found.'});
    }

    try {
        const gamesToDelete = await db.getGame(gameId);
        if (!gamesToDelete 
            || gamesToDelete[0].status !== 'pending') {
            return reply.status(404).send({ error : 'No available game found' });
        }
        if (gamesToDelete.length !== 1) {
			console.error('❌ Error while deleting game: ',  gamesToDelete.length, ' games found for gameId ', gameId);
            return reply.status(404).send({ error : 'Several available games found (critic: impossible)' });
		}
		if (gamesToDelete[0].id_user !== requestingUserId) {
			// console.log("Error because found user_id = ", gamesToDelete[0].user_id);
			return reply.status(401).send({ error: "Unauthorized: this is not your game"});
		}
        if (gamesToDelete[0].tournament_id)
            return reply.status(404).send({ error: 'Game is linked to a tournament' });

        const del = await db.deleteGame(gameId);
        return reply.status(200).send(del);
    } catch (error) {
        console.error('❌ Error deleting game: ' + error);
		return reply.status(500);
    }
}
