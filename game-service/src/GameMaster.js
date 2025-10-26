import GameServer from "./GameServer.js";
import fs from 'fs';

// Handles every GameServer
export default class GameMaster {
    static instance = null;

    constructor() {
        if (GameMaster.instance) {
            throw new Error("GameMaster instance already exists");
        }
        GameMaster.instance = this;
        this.games = new Map();

		// Load Q-table from JSON file
		const data = fs.readFileSync("q_table.json", "utf-8");
		this.qtable = JSON.parse(data);
		console.log("Q-Table loaded");
		// console.debug(this.qtable);
		// console.debug(typeof this.qtable);
		// console.debug(typeof this.qtable["00"]);
    }

    static getInstance() {
        if (!GameMaster.instance) {
            GameMaster.instance = new GameMaster();
        }
        return GameMaster.instance;
    }

    async addUserToGame(ws, userId, gameId) {
        if (this.games.has(Number(gameId))) {
			const game = this.games.get(Number(gameId));
            if (!game)
                return false;
			if (game.userId !== userId)
                return false;
            game.ws = ws;
            if (game.server.addWs(ws) == false) {
				return false;
			}
			console.log(`✅ User ${userId} authenticated to game ${gameId}`);
			return true;
		} 
		else {
			// console.debug(`❌ No game server available for user ${userId}`);
			return false;
		}
    }

    isUserPlaying(userId) {
        for (const [gameId, game] of this.games.entries()) {
            if (game.userId === userId) {
                return true;
            }
        }
        return false;
    }

    getUserIdByWs(targetWs) {
        for (const [gameId, game] of this.games.entries()) {
            if (game.ws === targetWs) {
                return game.userId;
            }
        }
        return null;
    }

    getGameIdByWs(targetWs) {
        for (const [gameId, client] of this.games.entries()) {
            if (client.ws === targetWs) {
                return gameId;
            }
        }
        return null;
    }

	getPlayersByGameId(gameId) {
		if (this.games.has(Number(gameId))) {
			return this.games.get(Number(gameId)).players;
		}
		return null;
	}

    // gameId has been checked when server creation is called
    createServer(gameId, userId, maxScore, tournament, ai, option, players) {
		console.log("Creating game with : tournament ",tournament, " ai, option ", ai, option);
		if (players.length != 2) {
			throw new Error("Invalid number of players");
		}
		this.games.set(Number(gameId), {
			server: new GameServer(Number(gameId), tournament, userId, maxScore, ai, option, this.qtable),
			tournament: tournament,
            userId: userId,
            ws: null,
			players: players
		});
		// console.debug("Games map after creation:");
		// console.debug(this.games);
		// console.debug(process._getActiveHandles().length);
		// console.debug(process._getActiveRequests().length);
    }

    // Call when a game is finished to destroy its object completely
    endServer(gameId) {
        if (!gameId) {
            console.warn(`No gameId given`);
            return ;
        }
        if (this.games.has(Number(gameId))) {
			const gamePart = this.games.get(Number(gameId));
            const user = gamePart.userId;
			gamePart.server.clean();
			gamePart.server = null;
            this.games.delete(Number(gameId));
            console.log("🔴 GameServer stopped");
        } else {
            console.warn(`No server associated with gameId ${gameId}`);
        }
    }
}