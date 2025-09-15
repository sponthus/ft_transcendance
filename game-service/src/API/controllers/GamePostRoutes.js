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
	let tournament = -1;
	let	ai = -1;
	let option = -1;
    try {
        // console.log("Trying to find games with gameId " + gameId);
        const game = await db.getGame(gameId);
        if (!game)
            return reply.status(404).send({ error : 'No game found' });
		userId = game.id_user;
        player_a = game.player_a;
        player_b = game.player_b;
        status = game.status;
        maxScore = game.score;
		if (game.tournament_id == null)
			tournament = 0;
		else
			tournament = game.tournament_id;
		ai = game.ai;
		option = game.option;
	}
    catch (error) {
		console.error('❌ Error fetching games: ');
		console.log(error);
        return reply.status(500).send({ error: "Internal server error while fetching games" });
    }
	
	// Only the user can launch his own games, game must be pending
	if (userId != requestingUserId)
		return reply.status(401).send({ error: "Unauthorized, this is not your game"});
	if (status !== 'pending')
		return reply.status(401).send({ error : 'Game is not pending' });

    try {
        // console.log("Trying to create game server with gameId " + gameId + " and userId " + userId);
        const gameMaster = GameMaster.getInstance();
        if (!gameMaster) {
			console.error('❌ Error : No GameMaster found while fetching games');
            return reply.status(500).send({error: 'Internal server error while fetching users'});
        }
        gameMaster.createServer(gameId, userId, maxScore, tournament, ai, option);
        // console.log("sending data : " + gameId + status + player_a + player_b);
        return reply.status(201).send({
            gameId: gameId, 
            status: status, 
            player_a: player_a, 
            player_b: player_b,
            maxScore: maxScore,
			tournament_id: tournament,
			ai: ai
        });
    }
    catch (error) {
        console.error('❌ Error creating game server:')
		console.log(error);
        return reply.status(500).send({error: 'Internal server error while creating games'});
    }
}

// Creation of a game for the player doing the request
// Security : Road is protected to logged-in users
// TODO = Add input validation VS SQL injections
export async function createGame(request, reply) {
	console.log('➡️ User accessed POST /game');

	const { idUser } = request.user;
	const { player_a, player_b, requestedMaxScore, requestedAi, requestedOption } = request.body;
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

	if ((requestedMaxScore && (requestedMaxScore < 1 && requestedMaxScore > 50))
		|| (requestedAi && (requestedAi != 0 && requestedAi != 1 && requestedAi != 2)) 
		|| (requestedOption && (requestedOption != 0 && requestedOption != 1))) {
		console.log("Bad options");
		return reply.status(400).send({error: 'Invalid options, expected : ai(0 | 1 | 2), option(0, 1), 1 <= maxScore <= 50 '});
	}

	let finalMaxScore = 7;
	let finalAi = 0;
	let finalOption = 1;
	if (requestedMaxScore) {
		if (requestedMaxScore < 1 && requestedMaxScore > 50) {
			console.log("Bad options");
			return reply.status(400).send({error: 'Invalid option, expected : 1 <= maxScore <= 50'});
		}
		finalMaxScore = requestedMaxScore;
	}
	if (requestedAi) {
		if (requestedAi != 0 && requestedAi != 1 && requestedAi != 2) {
			console.log("Bad options");
			return reply.status(400).send({error: 'Invalid option, expected : ai(0 | 1 | 2)'});
		}
		finalAi = requestedAi;
	}
	if (requestedOption) {
		if (requestedOption != 0 && requestedOption != 1) {
			console.log("Bad options");
			return reply.status(400).send({error: 'Invalid options, expected : option(0, 1)'});
		}
		finalOption = requestedOption;
	}
	console.log("Options taken into account = ", finalMaxScore, finalAi, finalOption);

    try {
        const result = await db.createGame(userId, player_a, player_b, finalMaxScore, finalAi, finalOption);
        return reply.status(201).send(result);
    }
    catch (error) {
		console.log("❌ Error creating game : ")
		console.log(error);
        return reply.status(500).send({ error: "Game creation failed " + error.message });
    }
}