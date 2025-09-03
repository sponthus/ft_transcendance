import GameMaster from '../../GameMaster.js';

// Starts a game server
// Security : Road is protected to logged-in users, only a user can launch his own games
export async function startGame(request, reply) {
	console.log('➡️ User accessed POST /:gameId');
    
	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized"});
	
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while starting game: database connection not found');
		return reply.status(500).send({error: 'No database connection found.'});
	}
	
	const { gameId } = request.params;
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }

    // Check if the game exists and is available to play and get its informations
    let userId = -1;
    let player_a = '';
    let player_b = '';
    let status = '';
    let maxScore = 7;
    try {
        // console.log("Trying to find games with gameId " + gameId);
        const games = await db.getGame(gameId);
        if (!games || games.length !== 1 || games[0].status !== 'pending') {
            return reply.status(404).send({ error : 'No available game found' });
        }
        userId = games[0].id_user;
        player_a = games[0].player_a;
        player_b = games[0].player_b;
        status = games[0].status;
        maxScore = games[0].score;
    }
    catch (error) {
        console.error('❌ Error fetching games: ', error);
        return ;
    }

	// Only the user can launch his own games
	if (userId != requestingUserId)
		return reply.status(401).send({ error: "Unauthorized, this is not your game"});

    try {
        // console.log("Trying to create game server with gameId " + gameId + " and userId " + userId);
        const gameMaster = GameMaster.getInstance();
        if (!gameMaster) {
            return reply.status(500).send({error: 'Internal server error while fetching users'});
        }
        gameMaster.createServer(gameId, userId, maxScore);
        // console.log("sending data : " + gameId + status + player_a + player_b);
        return reply.status(201).send({
            gameId: gameId, 
            status: status, 
            player_a: player_a, 
            player_b: player_b,
            maxScore: maxScore,
        });
    }
    catch (error) {
        console.error('❌ Error creating game server:', error);
        return reply.status(500).send({error: 'Internal server error while creating games'});
    }
}

// Creation of a game for the player doing the request
// Security : Road is protected to logged-in users
// TODO = Add input validation VS SQL injections
export async function createGame(request, reply) {
    console.log('➡️ User accessed POST /game');

	const { idUser } = request.user;
    const { player_a, player_b, maxScore } = request.body;
    const { db } = request.server;

	const userId = idUser;
	console.log('userId = ' + userId + ' playA ' + player_a + ' playB ' + player_b);
    if (!userId || !player_a || !player_b || player_a === player_b) {
		console.log("Lack of given data");
        return reply.status(400).send({error: 'Invalid input, expected : userId, player_a != player_b'});
    }
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
        return reply.status(500).send({error: 'No database connection found.'});
    }

    try {
        let result;
        if (maxScore) {
            result = await db.createGame(userId, player_a, player_b, 0, maxScore);
        } else {
            result = await db.createGame(userId, player_a, player_b, 0);
        }
        return reply.status(201).send(result);
    }
    catch (error) {
		console.log("❌ Error creating game : ", error);
        return reply.status(500).send({ error: "Game creation failed " + error.message });
    }
}