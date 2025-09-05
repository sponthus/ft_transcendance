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
                winner TEXT,
                players TEXT NOT NULL
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
    async   createGame(userId, playerA, playerB, tournamentId, maxScore = 7) {
        console.log(`maxScore: ${maxScore}`);
        return new Promise((resolve, reject) => {
            try {
                let res;
                if (tournamentId === 0) {
                    const stmt = this.db.prepare(`
                    INSERT INTO games (status, id_user, player_a, player_b, score) VALUES (?, ?, ?, ?, ?)
                    `);
                    res = stmt.run('pending', userId, playerA, playerB, maxScore);
                }
                else {
                    const stmt = this.db.prepare(`
                    INSERT INTO games (status, id_user, player_a, player_b, tournament_id, score) VALUES (?, ?, ?, ?, ?, ?)
                    `);
                    res = stmt.run('pending', userId, playerA, playerB, tournamentId, maxScore);
                }
                const id = res.lastInsertRowId;
                resolve({
                    game_id: id, 
                    status: 'pending', 
                    player_a: playerA, 
                    player_b: playerB,
                    maxScore: maxScore
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // Test OK
    async   getGamesForUserId(userId) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    SELECT *
                    FROM games
                    WHERE id_user = ?
                    ORDER BY created_at DESC
                `);
                const res = stmt.all(userId);
                // console.log(res);
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });
    }

    // Test ok
    async   getGame(gameId) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    SELECT *
                    FROM games
                    WHERE id = ?
                `);
                const res = stmt.all(gameId);
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });
    }

    // Test ok
    async   deleteGame(gameId) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    DELETE FROM games
                    WHERE id = ?
                `);
                const res = stmt.run(gameId);
                if (res.changes === 0) {
                    throw new Error("No game deleted with the given gameId");
                }
                resolve(res);
            } catch (error) {
                reject(error);
            }
        })
    }

    // test seems ok
    async   updateGameStatus(gameId, status) {
        console.log('updating game ' + gameId + ' with status ' + status);
        if (status === 'ongoing') {
            return new Promise((resolve, reject) => {
                try {
                    const stmt = this.db.prepare(`
                    UPDATE games 
                    SET status = ?, began_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `);
                    const res = stmt.run(status, gameId);
                    if (res.changes === 0) {
                        throw new Error("No game found with the given gameId");
                    }
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });
        }
        else if (status === 'finished' || status === 'canceled') {
            return new Promise((resolve, reject) => {
                try {
                    const stmt = this.db.prepare(`
                    UPDATE games 
                    SET status = ?, finished_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    `);
                    const res = stmt.run(status, gameId);
                    if (res.changes === 0) {
                        throw new Error("No game found with the given gameId");
                    }
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });
        }
        else {
            return new Promise((resolve, reject) => {
                reject('Unknown game status');
            });
        }
    }

    async   updateScore(gameId, newScoreA, newScoreB) {
        console.log("Test me !"); // TODO = Test me
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    UPDATE games 
                    SET score_a = ?, score_b = ? 
                    WHERE id = ?
                `);
                const res = stmt.run(newScoreA, newScoreB, gameId);
                if (res.changes === 0) {
                    return reject(new Error("No game found with the given gameId"));
                }
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });
    }

    async recordWinner(gameId) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.db.prepare(`
                    SELECT score_a, score_b, player_a, player_b 
                    FROM games
                    WHERE id = ?
                `);
                const game = stmt.get(gameId);
                if (!game)
                    reject(new Error("Game not found"));
                
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
                resolve({
                    message: `Game ${gameId} winner recorded: ${winner}`,
                    gameId,
                    winner
                });
            } catch (err) {
                reject(err);
            }
        });
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

    // TODO = test me
    // Creates a tournament, and the games for every round in tournament_matches + games
    createTournament(name, userId, players) {
        const transaction = this.db.transaction((userId, name, players) => {          
            const numberOfPlayers = players.length;
            if (numberOfPlayers != 4 || numberOfPlayers != 6 || numberOfPlayers != 8) {
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
                INSERT INTO tournaments(status, id_user, name, players) VALUES (?, ?, ?, ?);
            `);
            const createTournamentGamesStmt = this.db.prepare(`
                INSERT INTO games(status, id_user, player_a, player_b, tournament_id) VALUES (?, ?, ?, ?, ?);
            `);
            const createTournamentGamesTBAStmt = this.db.prepare(`
                INSERT INTO games(status, id_user, tournament_id) VALUES (?, ?, ?);
            `);
            const updateNextGameStmt = this.db.prepare(`
                UPDATE games 
                SET next_game = ?, 
                WHERE id = ?
            `);
            const createTournamentMatchesStmt = this.db.prepare(`
                INSERT INTO tournament_matches(tournament_id, round, match_number, game_id) VALUES (?, ?, ?, ?, ?, ?);
            `);

            const creationResult = createTournamentStmt.run("pending", userId, name, players);
            const tournamentId = creationResult.lastInsertRowId;
            
            const roundsResults = [];
            const nextGameId = -1;
            for (const round in rounds) {
                // Add games necessary for the round
                const gameResults = [];
                if (round == 0) {
                    // Register players for the 1st round only
                    while (players.length != 0) {
                        const player_a = players.pop();
                        const player_b = players.pop();
                        const gameResult = createTournamentGamesStmt.run("pending", userId, player_a, player_b, tournamentId);
                        gameResults.push(gameResult.lastInsertRowId);
                    }
                    // At 1st round, edit next-game
                    updateNextGameStmt.run(nextGameId, tournamentId);
                    nextGameId = gameResults[0];
                } else {
                    // Final round = 1 game
                    if (round == totalRounds) {
                       const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId);
                       gameResults.push(gameResult.lastInsertRowId);
                    } else {
                        // Middle-round = 2 games
                        for (const i = 0; i <= 1; i++) {
                            const gameResult = createTournamentGamesTBAStmt.run("pending", userId, tournamentId);
                            gameResults.push(gameResult.lastInsertRowId);
                        }
                    }
                }
    
                // Add necessary matches
                const matchesResults = [];
                i = 0;
                for (const _ of gameResults) {
                    const result = createTournamentMatchesStmt.run(tournamentId, round, i, gameResults[i]);
                    i++;
                    matchesResults.push(result.lastInsertRowId);
                }
                roundsResults.push({
                    round: round,
                    games: gameResults,
                    matches: matchesResults
                })
            }

            result = {
                tournamentId: tournamentId,
                rounds: roundsResults,
                nextGameId: nextGameId
            };

            return (result);
        });

        console.log("before rand: ", players);
        this.randomize(players);
        console.log("after rand: ", players);
        const result = transaction(userId, name, players);
        return (result);
    }
}