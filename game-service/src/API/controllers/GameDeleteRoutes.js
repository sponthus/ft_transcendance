import { checkIdFormat } from "../../tools/CheckFormat.js";

// Tests ok
// Secure with JWT and user ownership, input protected VS SQLi
// Delete a game if it is pending and belongs to the requesting user
export async function deleteGame(request, reply) {
	console.log('➡️ User accessed DELETE /:gameId');

    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized."});
    
	let { gameId } = request.params;
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }
	if (checkIdFormat(gameId) === false) {
		return reply.status(400).send({ error: 'Bad gameId format.'});
	}
	gameId = parseInt(gameId, 10);

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}
	
	console.log("Requesting user = ", requestingUserId, " / Game = ", gameId);

    try {
        const gameToDelete = await db.getGame(gameId);
        if (!gameToDelete) {
			return reply.status(404).send({ error : 'No game found.'});
		}
        if (gameToDelete.status !== 'pending') {
            return reply.status(403).send({ error : 'Unauthorized, game is not pending.' });
        }
		if (gameToDelete.id_user !== requestingUserId) {
			// console.log("Error because found user_id = ", gamesToDelete[0].user_id);
			return reply.status(403).send({ error: "Unauthorized, this is not your game."});
		}
        if (gameToDelete.tournament_id)
            return reply.status(403).send({ error: 'Unauthorized, game is linked to a tournament.' });

        const result = db.deleteGame(gameId);
        return reply.status(200).send(result);
    } catch (error) {
        console.error('❌ Error deleting game: ');
		console.log(error);
		return reply.status(500);
    }
}
