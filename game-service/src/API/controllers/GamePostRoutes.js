import { format } from 'node:path';
import GameMaster from '../../GameMaster.js';
import { checkGameCreationFormat, checkIdFormat } from '../../tools/CheckFormat.js';

// Starts a game server
// Security : Road is protected to logged-in users, only a user can launch his own games, protected versus SQLi
export async function startGame(request, reply) {
	console.log('➡️ User accessed POST /:gameId');
    
	const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized."});
	
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while starting game: database connection not found');
		return reply.status(500).send({error: 'No database connection found.'});
	}
	
	let { gameId } = request.params;
    if (!gameId) {
        return reply.status(400).send({error: 'No gameId found in request.'});
    }
	if (checkIdFormat(gameId) === false) {
		return reply.status(400).send({ error: "Bad gameId format"});
	}
	gameId = parseInt(gameId, 10);

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
            return reply.status(404).send({ error : 'No game found.' });
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
        return reply.status(500).send({ error: "Internal server error while fetching games." });
    }
	
	// Only the user can launch his own games, game must be pending
	if (userId != requestingUserId)
		return reply.status(401).send({ error: "Unauthorized, this is not your game."});
	if (status !== 'pending')
		return reply.status(401).send({ error : 'Game is not pending' });

    try {
        // console.log("Trying to create game server with gameId " + gameId + " and userId " + userId);
        const gameMaster = GameMaster.getInstance();
        if (!gameMaster) {
			console.error('❌ Error : No GameMaster found while fetching games');
            return reply.status(500).send({error: 'Internal server error while fetching games.'});
        }
        gameMaster.createServer(gameId, userId, maxScore, tournament, ai, option);
        return reply.status(201).send({
            gameId: gameId, 
            status: status, 
            player_a: player_a, 
            player_b: player_b,
            maxScore: maxScore,
			tournament_id: tournament,
			ai: ai,
			option: option
        });
    }
    catch (error) {
        console.error('❌ Error creating game server:')
		console.log(error);
        return reply.status(500).send({error: 'Internal server error while fetching games.'});
    }
}

// Creation of a game for the player doing the request
// Security : Road is protected to logged-in users, protected versus SQLi
export async function createGame(request, reply) {
	console.log('➡️ User accessed POST /game');

	const { idUser } = request.user;
	const formatCheck = checkGameCreationFormat(request);
	if (!formatCheck.valid) {
		console.log("Bad input format : ");
		console.log(formatCheck.errors);
		return reply.status(400).send({ error: 'Bad input format : expected player_a, player_b, optional requestedMaxScore, requestedAi, requestedOption. '});
	}
	const { player_a, player_b, requestedMaxScore, requestedAi, requestedOption } = request.body;
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while creating game: database connection not found');
		return reply.status(500).send({error: 'No database connection found.'});
	}

	const userId = idUser;
	console.log('userId = ' + userId + ' playA ' + player_a + ' playB ' + player_b);
	if (player_a === player_b) {
		console.log("Player A cannot be equal to Player B");
		return reply.status(400).send({error: 'Bad input format - player_a != player_b'});
	}
	if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({error: 'No database connection found.'});
	}

	let finalMaxScore = 7;
	let finalAi = 0;
	let finalOption = 1;
	if (requestedMaxScore) {
		finalMaxScore = requestedMaxScore;
	}
	if (requestedAi) {
		finalAi = requestedAi;
	}
	if (requestedOption) {
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
        return reply.status(500).send({ error: "Internal server error creating game."});
    }
}