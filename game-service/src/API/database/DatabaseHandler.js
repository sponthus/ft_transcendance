import Database from "better-sqlite3";

export default class DatabaseHandler {
    constructor(dbFile) {
        this.db = new Database(dbFile, { verbose: console.log });
        this.initializeDb();
    }
   
    initializeDb() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS tournaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('pending', 'ongoing_game', 'between-games', 'canceled', 'done')),
                id_user INTEGER NOT NULL,
                name TEXT NOT NULL,
                next_game INTEGER REFERENCES games(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                began_at DATETIME,
                finished_at DATETIME,
                winner TEXT
            );
        `);

        this.db.exec(`
                CREATE TABLE IF NOT EXISTS tournament_players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    tournament_id INTEGER REFERENCES tournaments(id),
                    name TEXT NOT NULL
                );
        `);

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
                score INTEGER DEFAULT 7
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
    async   createGame(userId, playerA, playerB, maxScore = 7) {
        // console.log(`maxScore: ${maxScore}`);
		const transaction = this.db.transaction((userId, playerA, playerB, maxScore) => {
			const stmt = this.db.prepare(`
	INSERT INTO games (status, id_user, player_a, player_b, score) VALUES (?, ?, ?, ?, ?)
			`);
			const res = stmt.run('pending', userId, playerA, playerB, maxScore);
			const id = res.lastInsertRowId;
			return ({
				game_id: id, 
				status: 'pending', 
				player_a: playerA, 
				player_b: playerB,
				maxScore: maxScore
			});
		});
		const result = transaction(userId, playerA, playerB, maxScore);
		return (result);
    }

    // Test OK
    getGamesForUserId(userId) {
        const transaction = this.db.transaction((userId) => {
			const stmt = this.db.prepare(`
	SELECT *
	FROM games
	WHERE id_user = ?
	ORDER BY created_at DESC
			`);
			const results = stmt.all(userId);
			return (results);
		});
		const results = transaction(userId);
		return (results);
    }

    // Test ok
    getGame(gameId) {
        const transaction = this.db.transaction((gameId) => {
			const stmt = this.db.prepare(`
	SELECT *
	FROM games
	WHERE id = ?
			`);
			const res = stmt.get(gameId);
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
    createTournament(name, userId, players) {
        const transaction = this.db.transaction((userId, name, players) => {          
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
	INSERT INTO tournaments(status, id_user, name) VALUES (?, ?, ?);
            `);
            
            const createTournamentPlayerStmt = this.db.prepare(`
	INSERT INTO tournament_players(tournament_id, name) VALUES (?, ?);
            `);

            const updateNextGameStmt = this.db.prepare(`
	UPDATE tournaments
	SET next_game = ? 
	WHERE id = ?
            `);
            const createTournamentGamesStmt = this.db.prepare(`
	INSERT INTO games(status, id_user, player_a, player_b, tournament_id) VALUES (?, ?, ?, ?, ?);
            `);
            const createTournamentGamesTBAStmt = this.db.prepare(`
	INSERT INTO games(status, id_user, tournament_id) VALUES (?, ?, ?);
            `);
            const createTournamentMatchesStmt = this.db.prepare(`
	INSERT INTO tournament_matches(tournament_id, round, match_number, game_id) VALUES (?, ?, ?, ?);
            `);

            const creationResult = createTournamentStmt.run("pending", userId, name);
            const tournamentId = creationResult.lastInsertRowid;
            
            const playersResult = [];
            for (const player of players) {
                const playerResult = createTournamentPlayerStmt.run(tournamentId, player);
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
                        const gameResult = createTournamentGamesStmt.run("pending", userId, player_a, player_b, tournamentId);
                        gameResults.push(gameResult.lastInsertRowid);
                    }
                    // At 1st round, edit next-game
                    nextGameId = gameResults[0];
                    updateNextGameStmt.run(nextGameId, tournamentId);
                } else {
                    // Final round = 1 game
                    if (round == totalRounds) {
                       const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId);
                       gameResults.push(gameResult.lastInsertRowid);
                    } else {
                        // Middle-round = 2 games
                        for (const i = 0; i <= 1; i++) {
                            const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId);
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
                tournamentId: tournamentId,
                numberOfPlayers: playersResult.length,
                rounds: roundsResults,
                nextGameId: nextGameId
            };
            return (result);
        });

        this.randomize(players);
        // console.log("len = ", players.length);

        const result = transaction(userId, name, players);
        return (result);
    }
}