import GameMaster from './GameMaster.js';

export async function createGame(request, reply) {
    const { userId, player_a, player_b, maxScore } = request.body;
    const { db } = request.server;

    console.log('User accessed POST /game');
    console.log('userId = ' + userId + ' playA ' + player_a + ' playB ' + player_b);
    if (!userId || !player_a || !player_b || player_a === player_b) {
        console.log("Lack of given data");
        return reply.status(400).send({error: 'Invalid input, expected : userId, player_a != player_b'});
    }
    if (!db) {
        return reply.status(400).send({error: 'No database connection found.'});
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
        return reply.status(400).send({ error: "Game creation failed " + error.message });
    }
}

// Test OK gives full history
export async function getGamesForUserId(request, reply) {
    const { userId } = request.params;
    const { db } = request.server;

    console.log('User accessed GET /:userId/games');
    if (!userId) {
        return reply.status(400).send({error: 'No userId found in request.'});
    }
    if (!db) {
        return reply.status(400).send({error: 'No database connection found.'});
    }

    try {
        console.log("Trying to find games with userId " + userId);
        const games = await db.getGamesForUserId(userId);
        if (!games || games.length === 0) {
            return reply.status(200).send([]);
        }
        console.log(`Found ${games.length} games for user ${userId}`);
        return reply.status(200).send(games);
    }
    catch (error) {
        console.error('Error fetching games:', error);
        return reply.status(500).send({error: 'Internal server error while fetching games'});
    }
}

// test OK
export async function getStatusForUserId(request, reply) {
    const { userId } = request.params;
    console.log('User accessed GET /:userId/status');
    if (!userId) {
        return reply.status(400).send({error: 'No userId found in request.'});
    }

    const gameMaster = GameMaster.getInstance();
    if (!gameMaster) {
        return reply.status(500).send({error: 'Internal server error while fetching users'});
    }
    console.log(`Looking for user`);
    const status = gameMaster.getUserStatus(userId);
    if (status === 'not found') {
        return reply.status(404).send({error: 'No user found in the server.'});
    }
    return reply.status(200).send({ userId: userId, status: status });
}

// Test ok normal case
export async function startGame(request, reply) {
    const { gameId } = request.params;
    const { db } = request.server;

    // TODO : Check user in log info
    console.log('User accessed POST /:gameId = ' + gameId);
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }
    if (!db) {
        return reply.status(400).send({error: 'No database connection found.'});
    }

    let userId = 0;
    let player_a = '';
    let player_b = '';
    let status = '';
    let maxScore = 7;
    // Check if the game exists and is available to play
    try {
        // console.log("Trying to find games with gameId " + gameId);
        const games = await db.getGame(gameId);
        if (!games || games.length !== 1 || games[0].status !== 'pending') {
            return reply.status(404).send({ error : 'No available game found' });
        }
        // TODO = Add authentication / userId
        userId = games[0].id_user;
        player_a = games[0].player_a;
        player_b = games[0].player_b;
        status = games[0].status;
        maxScore = games[0].score;
    }
    catch (error) {
        console.error('Error fetching games:', error);
        return ;
    }

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
        console.error('Error creating game server:', error);
        return reply.status(400).send({error: 'Internal server error while creating games'});
    }
}

export async function sendMessageToUser(request, reply) {
    const { userId } = request.params;
    // TODO = Allow use only from another service, identify sender via JWT
    const { sender, message } = request.body;

    if (!sender || !message) {
        return reply.status(400).send({
            error: 'Incomplete message : No sender or message found in request.' });
    }
    const gameMaster = GameMaster.getInstance();
    if (!gameMaster) {
        return reply.status(500).send({
            error: 'Internal server error while fetching users' });
    }

    try {
        switch (gameMaster.sendMessageToUser(userId, sender, message)) {
            case 1 :
                return reply.status(202).send({
                    userId: userId,
                    sender: sender,
                    message: message,
                    status: 'accepted' });
            case 2 :
                return reply.status(404).send({
                    error: 'Cannot find user' });
            default:
                return reply.status(200).send({
                    userId: userId,
                    sender: sender,
                    message: message,
                    status: 'sent' });
        }
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            error: error.message });
    }
}

// Tests ok normal case
export async function deleteGame(request, reply) {
    const { gameId } = request.params;
    const { db } = request.server;

    // TODO : Check user in log info
    console.log('User accessed DELETE /:gameId = ' + gameId);
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }
    if (!db) {
        return reply.status(400).send({error: 'No database connection found.'});
    }

    try {
        const gamesToDelete = await db.getGame(gameId);
        if (!gamesToDelete 
            || gamesToDelete[0].status !== 'pending') {
            return reply.status(404).send({ error : 'No available game found' });
        }
        if (gamesToDelete.length !== 1)
            return reply.status(404).send({ error : 'Several available games found (critic: impossible)' });
        if (gamesToDelete.tournament_id)
            return reply.status(404).send({ error: 'Game is linked to a tournament' });
        // TODO = Add authentication / userId

        const del = await db.deleteGame(gameId);
        return reply.status(200).send(del);
    } catch (error) {
        console.error('Error deleting game: ' + error);
    }
}
