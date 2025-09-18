import GameServer from "./GameServer.js";
import { gameEventEmitter } from "./GameEventEmitter.js";

// Handles every GameServer
export default class GameMaster {
    static instance = null;

    constructor() {
        if (GameMaster.instance) {
            throw new Error("GameMaster instance already exists");
        }
        GameMaster.instance = this;
        this.clients = new Map();
        this.games = new Map();
    }

    static getInstance() {
        if (!GameMaster.instance) {
            GameMaster.instance = new GameMaster();
        }
        return GameMaster.instance;
    }

    addUserToGame(ws, userId, gameId) {
        if (this.games.has(Number(gameId))) {
			const game = this.games.get(Number(gameId));
            if (!game)
                throw new Error("No game found for this id");
			if (game.userId !== userId)
                throw new Error("This game is not yours");
            game.ws = ws;
            game.server.addWs(ws);
			console.log(`✅ User ${userId} authenticated to game ${gameId}`);
		} 
		else {
			console.log(`❌ No game server available for user ${userId}`);
		}
    }

    // deleteUser(userId) {
    //     const deleted = this.clients.delete(Number(userId));
    //     if (deleted) {
    //         console.log(`User ${userId} removed. Remaining clients: ${this.clients.size}`);
    //     }
    //     return deleted;
    // }

    // getClientByUserId(userId) {
    //     return this.clients.get(Number(userId));
    // }

    // getWsByUserId(userId) {
    //     const client = this.clients.get(Number(userId));
    //     return client ? client.ws : null;
    // }

    getUserIdByWs(targetWs) {
        for (const [gameId, client] of this.games.entries()) {
            if (client.ws === targetWs) {
                return client.userId;
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


    // gameId has been checked when server creation is called
    createServer(gameId, userId, maxScore, tournament, ai, option) {
		console.log("Creating game with : tournament ",tournament, " ai, option ", ai, option);
        this.games.set(Number(gameId), {
			server: new GameServer(Number(gameId), tournament, userId, maxScore, ai, option),
			tournament: tournament,
            userId: userId,
            ws: null
		});
		console.log(this.games);
    }

    // Call when a game is finished to destroy its object completely
    endServer(gameId) {
        if (!gameId) {
            console.debug(`No gameId given`);
            return ;
        }
        if (this.games.has(Number(gameId))) {
            this.games.delete(Number(gameId));
            console.log("🔴 GameServer stopped");
        } else {
            console.debug(`No server associated with gameId ${gameId}`);
        }
    }
}