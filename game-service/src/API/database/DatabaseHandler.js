import Database from "better-sqlite3";

let NO_NEED = 0
let WAITING = 1
let ACCEPTED = 2
let REFUSED = 3

export default class DatabaseHandler {
    constructor(dbFile) {
        this.db = new Database(dbFile, { verbose: console.log });
        this.initializeDb();
    }
   
    initializeDb() {
        this.db.exec(`
	CREATE TABLE IF NOT EXISTS tournaments (
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('invitations', 'pending', 'ongoing_game', 'between_games', 'canceled', 'done')),
		id_user INTEGER NOT NULL,
		name TEXT NOT NULL,
		next_game INTEGER REFERENCES games(id),
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		began_at DATETIME,
		finished_at DATETIME,
		winner TEXT, 
		option INTEGER DEFAULT 1 CHECK (option IN (0, 1))
	);
        `);

        this.db.exec(`
	CREATE TABLE IF NOT EXISTS tournament_players (
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		tournament_id INTEGER REFERENCES tournaments(id),
		name TEXT,
		has_accepted INTEGER DEFAULT 0 CHECK (has_accepted IN (0, 1, 2, 3))
	);
        `); 
		// has_accepted = 0 doesn´t need to accept, 1 waiting, 2 accepted, 3 refused

        this.db.exec(`
	CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('pending', 'ongoing', 'finished', 'canceled')),
		id_user INTEGER NOT NULL,
		player_a TEXT NOT NULL DEFAULT 'undefined',
		player_b TEXT NOT NULL DEFAULT 'undefined',
		score_a INTEGER DEFAULT 0,
		score_b INTEGER DEFAULT 0,
		tournament_id INTEGER REFERENCES tournaments(id),
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		began_at DATETIME,
		finished_at DATETIME,
		winner TEXT,
		score INTEGER DEFAULT 7,
		ai INTEGER DEFAULT 0 CHECK (ai IN (0, 1, 2)),
		option INTEGER DEFAULT 1 CHECK (option IN (0, 1))
	);
        `);

        this.db.exec(`
	CREATE TABLE IF NOT EXISTS tournament_matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		tournament_id INTEGER REFERENCES tournaments(id),
		round INTEGER NOT NULL,
		match_number INTEGER NOT NULL,
		game_id INTEGER REFERENCES games(id)
	);
        `);
    }

    close() {
        this.db.close();
    }

    // Test ok
	// Creates a simple game, not a tournament one
    async   createGame(userId, playerA, playerB, maxScore = 7, ai = 0, option = 1) {
        // console.log(`maxScore: ${maxScore}`);
		const transaction = this.db.transaction((userId, playerA, playerB, maxScore, ai, option) => {
			const stmt = this.db.prepare(`
	INSERT INTO games (status, id_user, player_a, player_b, score, ai, option) VALUES (?, ?, ?, ?, ?, ?, ?)
			`);
			const res = stmt.run('pending', userId, playerA, playerB, maxScore, ai, option);
			const id = res.lastInsertRowid;
			return ({
				game_id: id, 
				status: 'pending', 
				player_a: playerA, 
				player_b: playerB,
				tournament: 0,
				maxScore: maxScore,
				ai: ai,
				option: option
			});
		});
		const result = transaction(userId, playerA, playerB, maxScore, ai, option);
		return (result);
    }

    // Test OK
    getGamesForUserId(userId) {
        const transaction = this.db.transaction((userId) => {
			const stmt = this.db.prepare(`
	SELECT id, 
		status, 
		player_a, 
		player_b, 
		score_a, 
		score_b, 
		tournament_id, 
		created_at, 
		began_at, 
		finished_at, 
		winner, 
		score, 
		ai, 
		option
	FROM games
	WHERE id_user = ?
	ORDER BY created_at DESC
			`);
			const results = stmt.all(userId);
			return (results);
		});
		let results = transaction(userId);
		results = results.map(game => {
        if (game.tournament_id == undefined) 
			game.tournament_id = 0;
			return game;
		});
		return (results);
    }

    // Test ok
	// Used internally only (gives userId)
    getGame(gameId) {
        const transaction = this.db.transaction((gameId) => {
			const stmt = this.db.prepare(`
	SELECT *
	FROM games
	WHERE id = ?
			`);
			let res = stmt.get(gameId);
			if (!res) 
				return null;
			if (res.tournament == undefined)
				res.tournament = 0;
			return (res);
		});
		const result = transaction(gameId);
		return (result);
    }

    // Test ok
    deleteGame(gameId) {
		const transaction = this.db.transaction((gameId) => {
			const stmt = this.db.prepare(`
	DELETE FROM games
	WHERE id = ?
			`);
			const res = stmt.run(gameId);
			if (res.changes === 0) {
				throw new Error("No game deleted with the given gameId");
			}
			return {
				deletedGameId: gameId
			};
		});
		const result = transaction(gameId);
		return (result);
    }

    // Test ok with ongoing & finished
    updateGameStatus(gameId, status) {
        console.log('updating game ' + gameId + ' with status ' + status);
        
		try {
			let transaction;
			if (status === 'ongoing') {
				transaction = this.db.transaction((gameId, status) => {
					const stmt = this.db.prepare(`
		UPDATE games 
		SET status = ?, began_at = CURRENT_TIMESTAMP
		WHERE id = ?
					`);
					const res = stmt.run(status, gameId);
					if (res.changes === 0) {
						throw new Error("No game found with the given gameId");
					}
					return {
						gameId: gameId,
						status: status
					};
				});
			}
			else if (status === 'finished' || status === 'canceled') {
				transaction = this.db.transaction((gameId, status) => {
					const stmt = this.db.prepare(`
		UPDATE games 
		SET status = ?, finished_at = CURRENT_TIMESTAMP
		WHERE id = ?
					`);
					const res = stmt.run(status, gameId);
					if (res.changes === 0) {
						throw new Error("No game found with the given gameId");
					}
					return {
						gameId: gameId,
						status: status
					};
				});
			}
			else
				throw new Error("Unknown game status");
	
			const result = transaction(gameId, status);
			return (result);
		} catch (error) {
			return ({ ok: false, error: error.message });
		}
    }

	// Test ok
    updateScore(gameId, newScoreA, newScoreB) {
        const transaction = this.db.transaction((gameId, newScoreA, newScoreB) => {
			const stmt = this.db.prepare(`
	UPDATE games 
	SET score_a = ?, score_b = ? 
	WHERE id = ?
			`);
			const res = stmt.run(newScoreA, newScoreB, gameId);
			if (res.changes === 0) {
				throw new Error("No game found with the given gameId");
			}
			const result = {
				gameId: gameId,
				scoreA: newScoreA,
				scoreB: newScoreB
			};
			return (result);
		});

		const result = transaction(gameId, newScoreA, newScoreB);
		return (result);
    }

	// Test ok
	recordWinner(gameId) {
		const transaction = this.db.transaction((gameId) => {
			const stmt = this.db.prepare(`
	SELECT score_a, score_b, player_a, player_b 
	FROM games
	WHERE id = ?
			`);
			const game = stmt.get(gameId);
			if (!game)
				throw new Error("Game not found");
			
			let winner = null;
			if (game.score_a > game.score_b) {
				winner = game.player_a;
			} else if (game.score_b > game.score_a) {
				winner = game.player_b;
			}
			const updateStmt = this.db.prepare(`
	UPDATE games 
	SET winner = ?, finished_at = CURRENT_TIMESTAMP 
	WHERE id = ?
			`);
			updateStmt.run(winner, gameId);
			return ({
				gameId: gameId,
				winner: winner
			});
		});

		const result = transaction(gameId);
		return (result);
	}

    // Mixes the players before assigning games
    randomize(tab) {
        let i, j, tmp;
        for (i = tab.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = tab[i];
            tab[i] = tab[j];
            tab[j] = tmp;
        }
        return (tab);
    } 

    // Creates a tournament, and the games for every round in tournament_matches + games
    createTournament(name, userId, players, option, has_users_to_wait) {
        const transaction = this.db.transaction((userId, name, players, option, has_users_to_wait) => {          
            // console.debug(`Players have to accept: ${has_users_to_wait}`);
			const numberOfPlayers = players.length;
            if (numberOfPlayers != 4 && numberOfPlayers != 6 && numberOfPlayers != 8) {
                throw new Error("Only 4, 6 or 8 players tournament available for now");
            }
            // Rounds = 0, 1 or 0, 1, 2
            let totalRounds;
            if (numberOfPlayers == 4)
                totalRounds = 1;
            else
                totalRounds = 2;
            const rounds = Array(0, totalRounds);

            const createTournamentStmt = this.db.prepare(`
	INSERT INTO tournaments(status, id_user, name, option) VALUES (?, ?, ?, ?);
            `);
            
            const createTournamentPlayerStmt = this.db.prepare(`
	INSERT INTO tournament_players(tournament_id, name, has_accepted) VALUES (?, ?, ?);
            `);

            const updateNextGameStmt = this.db.prepare(`
	UPDATE tournaments
	SET next_game = ? 
	WHERE id = ?
            `);
            const createTournamentGamesStmt = this.db.prepare(`
	INSERT INTO games(status, id_user, player_a, player_b, tournament_id, option) VALUES (?, ?, ?, ?, ?, ?);
            `);
            const createTournamentGamesTBAStmt = this.db.prepare(`
	INSERT INTO games(status, id_user, tournament_id, option) VALUES (?, ?, ?, ?);
            `);
            const createTournamentMatchesStmt = this.db.prepare(`
	INSERT INTO tournament_matches(tournament_id, round, match_number, game_id) VALUES (?, ?, ?, ?);
            `);
			
			let status = "pending";
			if (has_users_to_wait == true)
				status = "invitations";
			// console.log("CHOSEN STATUS = ", status);
			// console.log("status = ", status, "userId = ", userId, " name = ", name, " players = ", players, " option = ", option);
            const creationResult = createTournamentStmt.run(status, userId, name, Number(option));
            const tournamentId = creationResult.lastInsertRowid;
            
            const playersResult = [];
            for (const player of players) {
				let playerResult;
				if (player[0] === '@') {
					const playerId = Number(player.slice(1));
					let statusValue = WAITING;
					if (playerId === userId)
						statusValue = ACCEPTED;
                	playerResult = createTournamentPlayerStmt.run(tournamentId, player, statusValue);
				} else {
					playerResult = createTournamentPlayerStmt.run(tournamentId, player, NO_NEED);
				}
				playersResult.push(playerResult.lastInsertRowid);
            }

            let roundsResults = [];
            let nextGameId = -1;
            for (const round of rounds) {
                // Add games necessary for the round
                const gameResults = [];
                if (round == 0) {
                    // Register players for the 1st round only
                    while (players.length != 0) {
                        const player_a = players.pop();
                        const player_b = players.pop();
                        const gameResult = createTournamentGamesStmt.run("pending", userId, player_a, player_b, tournamentId, Number(option));
                        gameResults.push(gameResult.lastInsertRowid);
                    }
                    // At 1st round, edit next-game
                    nextGameId = gameResults[0];
                    updateNextGameStmt.run(nextGameId, tournamentId);
                } else {
                    // Final round = 1 game
                    if (round == totalRounds) {
                       const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId, Number(option));
                       gameResults.push(gameResult.lastInsertRowid);
                    } else {
                        // Middle-round = 2 games
                        for (const i = 0; i <= 1; i++) {
                            const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId, option);
                            gameResults.push(gameResult.lastInsertRowid);
                        }
                    }
                }
    
                // Add necessary matches
                let matchesResults = [];
                let i = 0;
                for (const _ of gameResults) {
                    const matchResult = createTournamentMatchesStmt.run(tournamentId, round, i, gameResults[i]);
                    matchesResults.push(matchResult.lastInsertRowid);
                    i++;
                }
                roundsResults.push({
                    round: round,
                    games: gameResults,
                    matches: matchesResults
                })
            }

            const result = {
                tournament_id: tournamentId,
				name: name,
				status: status,
                numberOfPlayers: playersResult.length,
                rounds: roundsResults,
                nextGameId: nextGameId,
				option: option,
				players: players
            };
            return (result);
        });

        this.randomize(players);
        // console.log("len = ", players.length);
		// console.debug(`Players have to accept: ${has_users_to_wait}`);
        const result = transaction(userId, name, players, option, has_users_to_wait);
        return (result);
    }

	// Internal only : gives id_user
	// Gives 1 tournament
	getTournament(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const stmt = this.db.prepare(`
	SELECT id, status, id_user, name, next_game, created_at, began_at, finished_at, winner, option
	FROM tournaments
	WHERE id = ?
	ORDER BY created_at DESC
			`);
			const results = stmt.get(tournamentId);
			return (results);
		});
		const results = transaction(tournamentId);
		return (results);
	}

	// Gives all informations except userId
	getTournamentsForUserId(userId) {
        const transaction = this.db.transaction((userId) => {
            const stmtCreated = this.db.prepare(`
    SELECT id, status, name, next_game, created_at, began_at, finished_at, winner, option, id_user AS created_by
    FROM tournaments
    WHERE id_user = ?
            `); // created by user
            const created = stmtCreated.all(userId);

            const stmtJoined = this.db.prepare(`
    SELECT t.id, t.status, t.name, t.next_game, t.created_at, t.began_at, t.finished_at, t.winner, t.option, t.id_user AS created_by
    FROM tournaments t
    JOIN tournament_players tp ON tp.tournament_id = t.id
    WHERE tp.name = ? AND t.id_user != ?
            `); // user is player not creator
            const joined = stmtJoined.all(`@${userId}`, userId);

            const combined = created.concat(joined);
            combined.sort((a, b) => {
                const da = new Date(a.created_at || 0).getTime();
                const db = new Date(b.created_at || 0).getTime();
                return db - da;
            });
            return (combined);
        });
        const results = transaction(userId);
        return (results);
    }

	getMatchesForTournamentId(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const stmt = this.db.prepare(`
	SELECT
		g.id,
		g.id_user AS created_by,
		tm.round,
		tm.match_number AS match,
		g.status,
		g.player_a,
		g.player_b,
		g.score_a,
		g.score_b,
		g.began_at,
		g.created_at,
		g.finished_at,
		g.winner,
		g.score,
		g.option
	FROM tournament_matches tm
	JOIN games g ON tm.game_id = g.id
	WHERE tm.tournament_id = ?
	ORDER BY tm.round, tm.match_number 
			`);
			const results = stmt.all(tournamentId);
			return (results);
		});
		const results = transaction(tournamentId);
		return (results);
	}

	getNextMatchForTournamentId(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const stmt = this.db.prepare(`
	SELECT
		tm.game_id,
		g.player_a,
		g.player_b,
		tm.round,
		tm.match_number AS match
	FROM tournaments t
	JOIN tournament_matches tm ON tm.game_id = t.next_game
	JOIN games g ON tm.game_id = g.id
	WHERE t.id = ?
	LIMIT 1
			`);
			const nextMatch = stmt.get(tournamentId);
			// console.debug("FOUND MATCH IN DB");
			// console.debug(nextMatch);
			if (nextMatch) {
				nextMatch.players = [nextMatch.player_a, nextMatch.player_b];
				delete nextMatch.player_a;
				delete nextMatch.player_b;
			}
			// console.debug("After edit : ");
			// console.debug(nextMatch);
			return (nextMatch);
		});
		const results = transaction(tournamentId);
		return (results);
	}

	// Can be used in cancel tournament + in decline invitation
	cancelTournamentLogic(tournamentId, status) {
		const getTournamentStmt = this.db.prepare(`
	SELECT status, name
	FROM tournaments 
	WHERE id = ?
		`);
		const tournament = getTournamentStmt.get(tournamentId);
		if (!tournament) {
			return { ok: false, error: "No tournament found to cancel" };
		}
		let updateStatusStmt = null;
		if (tournament.status === "pending" || tournament.status === "invitations") {
			updateStatusStmt = this.db.prepare(`
	UPDATE tournaments 
	SET status = ?, began_at = CURRENT_TIMESTAMP, finished_at = CURRENT_TIMESTAMP
	WHERE id = ?
			`);
		} 
		else {
			updateStatusStmt = this.db.prepare(`
	UPDATE tournaments 
	SET status = ?, finished_at = CURRENT_TIMESTAMP
	WHERE id = ?
			`);
		}
		const res = updateStatusStmt.run(status, tournamentId);
		if (res.changes === 0) {
			return { ok: false, error: "No tournament found with the given tournamentId" };
		}

		const cancelGamesStmt = this.db.prepare(`
	UPDATE games
	SET status = ?
	WHERE id IN (
		SELECT game_id
		FROM tournament_matches
		WHERE tournament_id = ? )
		`);
		cancelGamesStmt.run(status, tournamentId);

		const result = {
			tournamentId: tournamentId,
			name: tournament.name,
			status: status
		};
		return (result);
	}

	cancelTournament(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const res = this.cancelTournamentLogic(tournamentId, "canceled");
			return (res);
		});
		const result = transaction(tournamentId);
		return (result);
	}

	updateTournamentStatusLogic(tournamentId, status) {
		try {
			const updateStatusStmt = this.db.prepare(`
		UPDATE tournaments 
		SET status = ?
		WHERE id = ?
			`);
			if (status == "ongoing_game") {
				// console.debug("Maybe tournament is beginning ?");
				const getTournamentStmt = this.db.prepare(`
		SELECT status
		FROM tournaments
		WHERE id = ?
				`);
				const tournament = getTournamentStmt.get(tournamentId);
				// console.debug("tournament = ", tournament);
				if (tournament.status === "pending") {
					const updateBeganAtStmt = this.db.prepare(`
		UPDATE tournaments 
		SET began_at = CURRENT_TIMESTAMP
		WHERE id = ?
					`);
					updateBeganAtStmt.run(tournamentId);		
				}
			}
			const res = updateStatusStmt.run(status, tournamentId);
			if (res.changes === 0) {
				throw new Error("No tournament found with the given tournamentId");
			}
			return { ok: true};
		}
		catch (error) {
			return { ok: false, error: error.message };
		}
	}

	updateTournamentStatus(tournamentId, status) {
		// console.debug("Updating tournament ", tournamentId, " to status ", status);
        try {
			const transaction = this.db.transaction((tournamentId, status) => {
				const getTournamentStmt = this.db.prepare(`
		SELECT status
		FROM tournaments
		WHERE id = ?
				`);
				const tournament = getTournamentStmt.get(tournamentId);
				
				let updateStatusStmt = null;
				if (tournament.status === "pending") {
					// console.debug("Tournament is pending, setting began_at...");
					updateStatusStmt = this.db.prepare(`
		UPDATE tournaments 
		SET status = ?, began_at = CURRENT_TIMESTAMP
		WHERE id = ?
					`);
					// console.debug("Running update stmt...");
					const res = updateStatusStmt.run(status, tournamentId);
					// console.debug("Update stmt run, res = ", res);
					if (res.changes === 0) {
						// console.debug("Error in updateTournamentStatus: No tournament found with the given tournamentId");
						throw new Error("No tournament found with the given tournamentId");
					}
				} 
				else {
					const update = this.updateTournamentStatusLogic(tournamentId, status);
					if (!update.ok) {
						// console.debug("Error in updateTournamentStatus: ", update.error);
						throw new Error(update.error);
					}
				}
				const result = {
					tournamentId: tournamentId,
					status: status
				};
				return ({ ok: true, data: result });
			});
			const result = transaction(tournamentId, status);
			// console.debug("Result of updateTournamentStatus: ", result);
			return (result);
		} catch (error) {
			// console.debug("Error in updateTournamentStatus: ", error);
			return { ok: false, error: error.message };
		}
	}

	deleteTournament(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const deletePlayersStmt = this.db.prepare(`
	DELETE FROM tournament_players
	WHERE tournament_id = ?
			`);
			const deleteMatchesStmt = this.db.prepare(`
	DELETE FROM tournament_matches
	WHERE tournament_id = ?
			`);
			const deleteGamesStmt = this.db.prepare(`
	DELETE FROM games
	WHERE tournament_id = ?
			`);
			const clearNextGameStmt = this.db.prepare(`
	UPDATE tournaments
	SET next_game = NULL
	WHERE id = ?
			`);
			const deleteTournamentStmt = this.db.prepare(`
	DELETE FROM tournaments
	WHERE id = ?
			`);
			let res;
			res = deletePlayersStmt.run(tournamentId);
			if (res.changes === 0) {
				throw new Error("No players deleted with the given tournamentId");
			}
			res = deleteMatchesStmt.run(tournamentId);
			if (res.changes === 0) {
				throw new Error("No matches deleted with the given tournamentId");
			}
			clearNextGameStmt.run(tournamentId);
			res = deleteGamesStmt.run(tournamentId);
			if (res.changes === 0) {
				throw new Error("No game deleted with the given tournamentId");
			}
			res = deleteTournamentStmt.run(tournamentId);
			if (res.changes === 0) {
				throw new Error("No game deleted with the given tournamentId");
			}
			return { deletedTournamentId: tournamentId } ;
		});
		const result = transaction(tournamentId);
		return (result);
	}

	// Test is ok / 4 players
	endTournamentGame(tournamentId, gameId) {
		const transaction = this.db.transaction((tournamentId, gameId) => {
			// Find current match round & number
			const currentMatchStmt = this.db.prepare(`
	SELECT tm.round, tm.match_number, g.winner
	FROM tournament_matches tm
	JOIN games g ON tm.game_id = g.id
	WHERE tm.tournament_id = ? AND tm.game_id = ?
			`);
			
			const currentMatch = currentMatchStmt.get(tournamentId, gameId);
			if (!currentMatch) 
				throw new Error("Current match not found");
		
			// Find next match on the same round 
			const nextMatchSameRoundStmt = this.db.prepare(`
	SELECT game_id
	FROM tournament_matches
	WHERE tournament_id = ? AND round = ? AND match_number = ?
			`);

			let nextMatch = nextMatchSameRoundStmt.get(
				tournamentId,
				currentMatch.round,
				currentMatch.match_number + 1
			);

			// No more match on this round -> Is there a new round ?
			if (!nextMatch) {
				// Find next round match 0
				const nextMatchNextRoundStmt = this.db.prepare(`
	SELECT game_id
	FROM tournament_matches
	WHERE tournament_id = ? AND round = ? AND match_number = 0
				`);
				nextMatch = nextMatchNextRoundStmt.get(
					tournamentId,
					currentMatch.round + 1
				);
			}
		
			const updateNextGameStmt = this.db.prepare(`
	UPDATE tournaments
	SET next_game = ?
	WHERE id = ?
			`);
				
			if (nextMatch) {
				// Update tournament next_game
				updateNextGameStmt.run(nextMatch.game_id, tournamentId);

				// Update players for the next game, at the right spot
				const nextRound = currentMatch.round + 1;
				// Match 0 & 1 round 0 = match 0 round 1 || Match 2 & 3 round 0 = match 1 round 1 || Round 1 match 0 & 1 -> Round 2 match 0
				const nextMatchNumber = Math.floor(currentMatch.match_number / 2);

				// Find corresponding game to see it it has player_a & player_b
				const nextRoundMatchStmt = this.db.prepare(`
	SELECT game_id, player_a, player_b
	FROM tournament_matches
	JOIN games ON tournament_matches.game_id = games.id
	WHERE tournament_matches.tournament_id = ? AND tournament_matches.round = ? AND tournament_matches.match_number = ?
				`);
				const nextRoundMatch = nextRoundMatchStmt.get(tournamentId, nextRound, nextMatchNumber);

				if (nextRoundMatch) {
					// Slot to fill
					if (currentMatch.match_number % 2 === 0 && nextRoundMatch.player_a === "undefined") {
						// Winner goes to player_a
						const updatePlayerAStmt = this.db.prepare(`
	UPDATE games SET player_a = ? WHERE id = ?
						`);
						updatePlayerAStmt.run(currentMatch.winner, nextRoundMatch.game_id);
					} else if (currentMatch.match_number % 2 === 1 && nextRoundMatch.player_b === "undefined") {
						// Winner goes to player_b
						const updatePlayerBStmt = this.db.prepare(`
							UPDATE games SET player_b = ? WHERE id = ?
						`);
						updatePlayerBStmt.run(currentMatch.winner, nextRoundMatch.game_id);
					}

					// Update tournament status
					const updateTournamentStatus = this.updateTournamentStatusLogic(tournamentId, "between_games");
					if (!updateTournamentStatus.ok) {
						throw new Error("Could not update tournament status: " + updateTournamentStatus.error);
					} // TODO check throw ?
				}
			} 
			else {
				// Tournament is over, no next game
				updateNextGameStmt.run(null, tournamentId);

				// Set the tournament winner & status
				const updateTournamentWinner = this.db.prepare(`
	UPDATE tournaments
	SET winner = ?, status = ?, finished_at = CURRENT_TIMESTAMP
	WHERE id = ?
				`);
				updateTournamentWinner.run(currentMatch.winner, "done", tournamentId);
			}
			
			return {
				tournamentId,
				next_game: nextMatch ? nextMatch.game_id : null
			};

		});
		const result = transaction(tournamentId, gameId);
		return (result);
	}
	
	// Test ok
	changeInvitationStatusLogic(userId, tournamentId, newStatus) {
		const getTournamentStmt = this.db.prepare(`
	SELECT status
	FROM tournaments
	WHERE id = ?
			`);
		const tournament = getTournamentStmt.get(tournamentId);
		if (!tournament) {
			return {ok: false, error: "Tournament not found"};
		}
		if (tournament.status !== "invitations") {
			console.log(tournament.status);
			return {ok: false, error: `Tournament is not in a state of invitations`};
		}
		
		const getPlayerStmt = this.db.prepare(`
	SELECT has_accepted
	FROM tournament_players
	WHERE tournament_id = ? AND name = ?
			`);
		const player = getPlayerStmt.get(tournamentId, `@${userId}`);
		if (!player) {
			return {ok: false, error: "Player not found in this tournament"};
		}
		if (player.has_accepted === NO_NEED) {
			return {ok: false, error: "Player does not need to accept or refuse invitation"};
		} else if (player.has_accepted === ACCEPTED && newStatus === ACCEPTED) {
			return {ok: false, error: "Player already accepted invitation"};
		} else if (player.has_accepted === ACCEPTED && newStatus === REFUSED) {
			return {ok: false, error: "Player already accepted invitation, cannot go back"};
		}
	
		const updatePlayerStmt = this.db.prepare(`
	UPDATE tournament_players
	SET has_accepted = ?
	WHERE tournament_id = ? AND name = ?
			`);
		const res = updatePlayerStmt.run(newStatus, tournamentId, `@${userId}`);
		if (res.changes === 0) {
			console.log("No changes made when updating player status");
			return {ok: false, error: "Player already accepted or declined invitation"};
		}
		return {ok: true};
	}

	acceptTournamentInvitation(userId, tournamentId) {
		try {
			const transaction = this.db.transaction((userId, tournamentId) => {
				const result = this.changeInvitationStatusLogic(userId, tournamentId, ACCEPTED);
				// console.debug("Change invitation status logic result:");
				// console.debug(result);
				if (!result.ok) {
					return ({ ok: false, ready: false, error: result.error });
				}
				const hasAllPlayerAccepted = this.checkAllPlayersAcceptedLogic(tournamentId);
				if (!hasAllPlayerAccepted.ok) {
					return ({ok: true, ready: false});
				} else {
					const changeTournamentStatus = this.updateTournamentStatusLogic(tournamentId, "pending");
					if (!changeTournamentStatus.ok) {
						return { ok: false, ready: false, error: "Could not change tournament status because: " + changeTournamentStatus.error };
					}
				}
				return ({ ok: true, ready: true, error: false, result: result, playerIds: hasAllPlayerAccepted.players, owner: hasAllPlayerAccepted.owner });
			});
			const result = transaction(userId, tournamentId);
			return (result);
		}
		catch (error) {
			return { ok: false, ready: false, error: "Internal server error : " + error.message };
		}
	}

	checkAllPlayersAcceptedLogic(tournamentId) {
		try {
			const stmt = this.db.prepare(`
		SELECT name, has_accepted
		FROM tournament_players
		WHERE tournament_id = ?
			`);
			const rows = stmt.all(tournamentId);
			// console.debug(rows);
			if (!rows || rows.length === 0) {
				throw new Error("No players found");
			} 
			else {
				let players = rows
					.filter(row => row.has_accepted === ACCEPTED)
					.map(row => row.name);
				for (let i = 0; i < players.length; i++) {
					players[i] = players[i].slice(1); // remove @
				}
				
				let waitingFor = rows.filter(row => row.has_accepted !== ACCEPTED).map(row => row.name);
				for (let i = 0; i < waitingFor.length; i++) {
					waitingFor[i] = waitingFor[i].slice(1); // remove @
				}
				if (waitingFor.length === 0) {
					return {ok: true, waitingFor: [], players: players};
				}
				else 
					return {ok: false, waitingFor: waitingFor, players: players};
			}
		} catch (error) {
			return {ok: false, waitingFor: [], players: [], error: "Internal server error : " + error.message };
		}
	}

	// Test ok
	checkAllPlayersAccepted(tournamentId) {
		const transaction = this.db.transaction((tournamentId) => {
			const result = this.checkAllPlayersAcceptedLogic(tournamentId);
			return (result);
		});
		const result = transaction(tournamentId);
		return (result);
	}

	// Test ok
	declineTournamentInvitation(userId, tournamentId) {
		try {
			const transaction = this.db.transaction((userId, tournamentId) => {
				const result = this.changeInvitationStatusLogic(userId, tournamentId, REFUSED);
				if (!result.ok) {
					throw new Error(result.error);
				}
				const cancelTournamentResult = this.cancelTournamentLogic(tournamentId, "canceled");
				if (!cancelTournamentResult) {
					throw new Error("Could not cancel the tournament because: " + cancelTournamentResult.error);
				}
				const getPlayerStmt = this.db.prepare(`
	SELECT name, has_accepted
	FROM tournament_players
	WHERE tournament_id = ?
				`);
				let playersToNotify = getPlayerStmt
					.all(tournamentId)
					.filter(row => row.has_accepted === ACCEPTED || row.has_accepted === WAITING)
					.map(row => row.name);
				for (let i = 0; i < playersToNotify.length; i++) {
					playersToNotify[i] = playersToNotify[i].slice(1); // remove @
				}
				return { ok: true, playersToNotify: playersToNotify };
			});
			const result = transaction(userId, tournamentId);
			return (result);
		} catch (error) {
			return { ok: false, error: error.message };
		}
	}
}