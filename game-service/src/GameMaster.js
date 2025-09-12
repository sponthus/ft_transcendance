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

    addUser(ws, userId) {
        this.clients.set(Number(userId), {
            ws,
            status: 'online',
            currentGame: 0,
            messages: []
        });
    }

    deleteUser(userId) {
        const deleted = this.clients.delete(Number(userId));
        if (deleted) {
            console.log(`User ${userId} removed. Remaining clients: ${this.clients.size}`);
        }
        return deleted;
    }

    // TODO check me, add a way to disconnect someone on purpose ?
    disconnectUser(userId) {
        if (!this.isUserConnected(Number(userId))) {
            console.log(`User ${userId} not connected when trying to disconnect`);
            return;
        }
        const client = this.clients.get(Number(userId));
        client.status = 'disconnected';
        client.currentGame = 0;
        client.ws = null;
    }

    getClientByUserId(userId) {
        return this.clients.get(Number(userId));
    }

    getWsByUserId(userId) {
        const client = this.clients.get(Number(userId));
        return client ? client.ws : null;
    }

    getUserIdByWs(targetWs) {
        for (const [userId, client] of this.clients.entries()) {
            if (client.ws === targetWs) {
                return userId;
            }
        }
        return null;
    }

    getAllConnectedUsers() {
        return Array.from(this.clients.keys());
    }

    isUserConnected(userId) {
        const client = this.clients.get(Number(userId));
        return client && client.status !== 'disconnected';
    }

    sendMessageToUser(userId, sender, message) {
        const client = this.getClientByUserId(userId);
        if (!client) {
            return 2;
        }
        if (this.isUserConnected(Number(userId)) && client.status !== 'playing') {
            if (client.ws.readyState === 1) {
				client.ws.send(JSON.stringify({
					type: 'message',
                    sender: sender,
                    message: message}));
				console.log(`Message sent to user ${userId}:`, message);
                return 0;
            } else
                throw new Error(`Internal server error : Websocket connection failed`);
        } else {
            console.log(`User ${userId} is not connected or playing, storing the message`);
            client.messages.push(JSON.stringify({
                sender: sender,
                message: message,
            }));
            return 1;
        }
    }

    sendListOfMessagesToUser(userId, messages) {
        console.log(`messages to send ${messages.length}`);
        for (const message of messages) {
            let trMessage = JSON.parse(message);
            this.sendMessageToUser(userId, trMessage.sender, trMessage.message);
        }
    }

    sendStoredMessagesToUser(userId) {
        const client = this.getClientByUserId(userId);
        const messages = client.messages;

        this.sendListOfMessagesToUser(userId, messages);
    }

    getUserStatus(userId) {
        const client = this.clients.get(Number(userId));
        if (!client) {
            console.log('Not found');
            return 'not found';
        }
        console.log(`User ${userId} is ${client.status}`);
        return client.status;
    }

    // gameId has been checked when server creation is called
    createServer(gameId, userId, maxScore, tournament, ai, option) {
        const client = this.clients.get(Number(userId));
        if (!client) {
            throw new Error('user not found for userId ' + userId);
        }
        if (!this.isUserConnected(userId)) {
            throw new Error('User not connected: userId ' + userId);
        }
        const ws = client.ws;
        if (!ws) {
            throw new Error('ws not found for userId ' + userId);
        }
        client.status = 'playing';
        client.currentGame = Number(gameId);
		console.log("Setting games with : tournament ",tournament, " ai, option ", ai, option);
        this.games.set(Number(gameId), {
			server: new GameServer(Number(gameId), userId, ws, maxScore, ai, option),
			tournament: tournament
		});
		console.log(this.games);
    }

    // Call when a game is finished to destroy its object completely
    endServer(userId) {
        const client = this.clients.get(userId);
        if (!client) {
            console.log(`user not found`);
            throw new Error('user not found for userId ' + userId);
        }
        const gameId = Number(client.currentGame);
        if (!gameId) {
            console.log(`user is not playing`);
            throw new Error(`user with userId ${userId} is not playing`);
        }
		console.log(this.games);
        if (this.games.has(gameId)) {
            const gameObj = this.games.get(gameId);
            const tournament = gameObj.tournament;
            if (tournament != 0) {
                // TODO = Check me
                gameEventEmitter.emitTournamentEvent('tournament:endgame', tournament, {
                    gameId: gameId
                });
            }
            this.games.delete(gameId);
            console.log("🔴 GameServer stopped");
            client.currentGame = 0;
            if (client.ws && client.ws.readyState === 1) {
                client.status = 'online';
            }
        } else {
            console.log(`No server associated with gameId ${gameId}`);
        }
        this.sendStoredMessagesToUser(userId);
    }
}