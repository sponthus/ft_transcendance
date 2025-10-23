import GameMaster from '../../GameMaster.js';
import { checkIdFormat } from '../../tools/CheckFormat.js';
import { getUserIdFromSlug } from '../requests/GetUserIdFromSlug.js';
import { getUserInfoFromId } from '../requests/GetUserInfoFromId.js';

// Starts a game server
// Security : Road is protected to logged-in users, only a user can launch his own games, protected versus SQLi
export async function startGame(request, reply) {
	console.log('➡️ User accessed POST /:gameId');
    
	const requestingUserId = request.user.idUser;
	if (!requestingUserId) {
		console.error("❌ Unauthorized user trying to start a game");
		return reply.code(401).send({ error: "Unauthorized."});
	}
	
	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while starting game: database connection not found');
		return reply.code(500).send({error: 'No database connection found.'});
	}
	
	let { gameId } = request.params;
    if (!gameId) {
		console.error("❌ No gameId found in request.");
        return reply.code(400).send({error: 'No gameId found in request.'});
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
        if (!game) {
			console.error("❌ No game found: ", gameId);
            return reply.code(404).send({ error : 'No game found.' });
		}
		userId = game.id_user;
        player_a = game.player_a;
        player_b = game.player_b;
        status = game.status;
        maxScore = game.score;
		if (game.tournament_id == null)
			tournament = 0;
		else {
			tournament = game.tournament_id;
			const tournamentIsReady = await db.checkAllPlayersAccepted(tournament);
			if (!tournamentIsReady.ok) {
				// console.debug("❓ Tournament is not ready, waiting for players to accept before completing: ", tournamentIsReady.waitingFor);
				try {
					let playersToWait = [];
					for (let player of tournamentIsReady.waitingFor) {
						if (player[0] === '@') {
							const playerId = player.slice(1);
							const playerName = await getUserInfoFromId(playerId);
							if (!playerName.ok || !playerName.infos || !playerName.infos.slug || playerName.infos.slug == undefined) {
								console.error("❌ Player slug not found: ", playerId);
								playersToWait.push(`@${playerId}`);
							} else {
								playersToWait.push(`@${playerName.infos.slug}`);
							}
						}
					}
					console.log("❓ Tournament not ready, waiting for: ", playersToWait.join(", "));
					return reply.code(404).send({ error: `Tournament not ready, waiting for players` });
				} catch (error) {
					console.error('❌ Error fetching user info: ');
					console.error(error);
					return reply.code(500).send({ error: "Internal server error while fetching user info." });
				}
			}
		}
		ai = game.ai;
		option = game.option;
	}
    catch (error) {
		console.error('❌ Error fetching games: ');
		console.error(error);
        return reply.code(500).send({ error: "Internal server error while fetching games." });
    }
	
	// Only the user can launch his own games, game must be pending
	if (userId != requestingUserId) {
		console.error("❌ Unauthorized user trying to start game: ", requestingUserId, " for game ", gameId);
		return reply.code(401).send({ error: "Unauthorized, this is not your game."});
	}
	if (status !== 'pending') {
		console.error("❌ Trying to launch a game that is not pending: ", gameId, " status=", status);
		return reply.code(401).send({ error : 'Game is not pending' });
	}

	try {
		if (player_a[0] == '@') {
			const player1Id = player_a.slice(1);
			const player1Name = await getUserInfoFromId(player1Id);
			if (!player1Name.ok) {
				console.error("❌ Player not found: ", player1Id);
				return reply.code(404).send({ error: "User not found" });
			}
			else {
				player_a = `@${player1Name.infos.slug}`;
				console.debug(`Replaced @${player1Id} with ${player_a}`);
			}
		}
		if (player_b[0] == '@') {
			const player2Id = player_b.slice(1);
			const player2Name = await getUserInfoFromId(player2Id);
			if (!player2Name.ok) {
				console.error("❌ Player not found: ", player2Id);
				return reply.code(404).send({ error: "User not found" });
			}
			player_b = `@${player2Name.infos.slug}`;
			console.debug(`Replaced @${player2Id} with ${player_b}`);
		}
	} catch (error) {
		console.error('❌ Error fetching user info: ');
		console.error(error);
		return reply.code(500).send({ error: "Internal server error while fetching user info." });
	}
    try {
        console.debug("Trying to create game server with gameId " + gameId + " and userId " + userId);
        const gameMaster = GameMaster.getInstance();
        if (!gameMaster) {
			console.error('❌ Error : No GameMaster found while fetching games');
            return reply.code(500).send({error: 'Internal server error while fetching games.'});
        }
        gameMaster.createServer(gameId, userId, maxScore, tournament, ai, option, [player_a, player_b]);
        console.debug("✅ Game server created with gameId " + gameId);
		return reply.code(201).send({
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
		console.error(error);
        return reply.code(500).send({error: 'Internal server error while fetching games.'});
    }
}

// Creation of a game for the player doing the request
// Security : Road is protected to logged-in users, protected versus SQLi
export async function createGame(request, reply) {
	console.log('➡️ User accessed POST /game');

	const { idUser } = request.user;
	let { player_a, player_b, requestedMaxScore, requestedAi, requestedOption } = request.body;
	
	if (player_a === player_b) {
		console.error("❌ Player A cannot be equal to Player B");
		return reply.code(400).send({error: 'Bad input format - Player A cannot be equal to Player B'});
	}
	
	const player1Slug = player_a;
	const player2Slug = player_b;
	try {
		if (player_a[0] === '@') {
			const player1SlugSliced = player_a.slice(1);
			const player1Id = await getUserIdFromSlug(player1SlugSliced);
			if (!player1Id.ok) {
				console.error("❌ Unable to get userId from slug: ", player_a);
				return reply.code(404).send({ error: `Requested user ${player_a} not found.`});
			}
			else {
				if (checkIdFormat(player1Id.userId) === false) {
					console.error("❌ Bad userId format got from slug");
					return reply.code(500).send({ error: 'Internal server error: Wrong user data format.'});
				}
				let userId = parseInt(player1Id.userId, 10);
				player_a = `@${userId}`;
				console.debug(`Replaced ${player1Slug} with ${player_a}`);
			}
		}
		if (player_b[0] === '@') {
			const player2SlugSliced = player_b.slice(1);
			const player2Id = await getUserIdFromSlug(player2SlugSliced);
			if (!player2Id.ok) {
				console.error("❌ Unable to get userId from slug: ", player_b);
				return reply.code(404).send({ error: `Requested user ${player_b} not found.`});
			}
			else {
				if (checkIdFormat(player2Id.userId) === false) {
					console.error("❌ Bad userId format got from slug");
					return reply.code(500).send({ error: 'Internal server error: Wrong user data format.'});
				}
				let userId = parseInt(player2Id.userId, 10);
				player_b = `@${userId}`;
				console.debug(`Replaced ${player2Slug} with ${player_b}`);
			}
		}
	} catch (error) {
		console.error('❌ Error fetching userId from slug: ');
		console.error(error);
		return reply.code(500).send({ error: "Internal server error while fetching userId from slug." });
	}

	const { db } = request.server;
	if (!db) {
		console.error('❌ Error while creating game: database connection not found');
		return reply.code(500).send({error: 'No database connection found.'});
	}

	const userId = idUser;
	// console.debug('userId = ' + userId + ' playA ' + player_a + ' playB ' + player_b);

	if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.code(500).send({error: 'No database connection found.'});
	}

	let finalMaxScore = 7;
	let finalAi = 0;
	let finalOption = 1;
	if (Number(requestedMaxScore) > 0) {
		finalMaxScore = Number(requestedMaxScore);
	}
	if (Number(requestedAi) >= 0) {
		finalAi = Number(requestedAi);
	}
	if (Number(requestedOption) == 0) {
		finalOption = Number(requestedOption);
	}

    try {
        const result = await db.createGame(userId, player_a, player_b, finalMaxScore, finalAi, finalOption);
        console.debug("Game created with id ", result.game_id);
		return reply.code(201).send({
			gameId: result.game_id,
			status: result.status,
			player_a: player1Slug,
			player_b: player2Slug,
			tournament: result.tournament,
			maxScore: result.maxScore,
			ai: result.ai,
			option: result.option
		});
    }
    catch (error) {
		console.error("❌ Error creating game : ")
		console.error(error);
        return reply.code(500).send({ error: "Internal server error creating game."});
    }
}
