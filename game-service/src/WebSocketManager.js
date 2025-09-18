import GameMaster from './GameMaster.js';

const gameMaster = GameMaster.getInstance();

export default class WebSocketManager {
    constructor(wss, fastify) {
        this.ws = wss;
        this.fastify = fastify;
        this.unknownClients = [];
    }

    initializeWebSocket() {
        this.ws.on('connection', (ws, request) => {
            console.log('🟢 New WebSocket connection');

            ws.on('message', (data) => {
                let message;
                try {
                    message = JSON.parse(data);
                    // TODO: Add a handler for messages that do not contain "type" 
                    // = 1007 error, do not print token in logs
                    // console.log('Message received :', message);
                    if (message.type !== 'input')
                        console.log('Message received :', message);
                } catch (error) {
                    console.error('❌ Invalid JSON recieved:', error);
                }

                try {
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('❌ Error treating message:', error);
                }
            });

            ws.on('close', () => {
                console.log('🔴 Connection closed');
            });

            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
            });
        });
    }

    handleMessage(ws, message) {
        switch(message.type) {
            case 'ping':
                this.pong(ws);
                break;
            case 'auth':
                // TODO : Add content check
                this.authenticateUser(ws, message.token, message.gameId);
                break;
            case 'input':
                break;
            default:
                console.warn("⚠️ Type not recognized");
            // case 'join_game':
            //     this.handleJoinGame(ws, message.gameId);
            //     break;

        }
    }

    pong(ws) {
        if (ws.readyState === 1) {
            this.sendToWs(ws, { type: 'pong' });
        } else
			console.error("❌ Unable to send pong back");
    }

    sendToWs(ws, message) {
		if (ws.readyState == 1) {
			ws.send(JSON.stringify(message));
			console.log(`Message sent to socket:`, message);
		} else {
			console.warn(`❌ Cannot send message to socket: disconnected`);
		}
	}

    handleConnexion(ws) {
        this.unknownClients.push(ws);
		
		// Execute once after 10s: check if ws has auth
		setTimeout(() => {
			if (gameMaster.getUserIdByWs(ws) == null) {
				ws.close(4001, "Authentication timeout");
			} else {
				this.unknownClients = this.unknownClients.filter(c => c !== ws);
			}
		}, 10000);
    }

    //
    // broadcastToGame(gameId, message) {
    //     const game = this.games.get(gameId);
    //     if (game) {
    //         game.players.forEach(playerId => {
    //             const client = this.clients.get(playerId);
    //             if (client?.ws.readyState === 1) { // WebSocket.OPEN
    //                 client.ws.send(JSON.stringify(message));
    //             }
    //         });
    //     }
    // }

    authenticateUser(ws, token, gameId) {
        if (!token) {
            console.warn('Authentication failed: no token provided');
            return;
        }
        if (!gameId) {
            console.warn('Authentication failed: no gameId provided');
            return;
        }

        let data = {};
		try {
            data = this.fastify.jwt.verify(token);
		} catch (err) {
			console.error("❌ Invalid token:", err.message);
			ws.close(4002, "Invalid authentication");
			return ;
		}

        console.log(data);
        gameMaster.addUserToGame(ws, data.idUser, gameId);
        
		this.sendToWs(ws, {
            type: 'auth_success',
            gameId: gameId,
            timestamp: Date.now()
        });
    }

    sendToUser(userId, message) {
        const ws = gameMaster.getWsByUserId(userId);
        if (ws && ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify(message));
            console.log(`Message sent to user ${userId}:`, message);
            return true;
        } else {
            console.warn(`Cannot send message to user ${userId}: not connected`);
            return false;
        }
    }

    sendToUsers(userIds, message) {
        let sentCount = 0;
        userIds.forEach(userId => {
            if (this.sendToUser(userId, message)) {
                sentCount++;
            }
        });
        console.log(`Message sent to ${sentCount}/${userIds.length} users`);
        return sentCount;
    }
}