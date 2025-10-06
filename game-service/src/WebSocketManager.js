import GameMaster from './GameMaster.js';
import { checkWebSocketMessageFormat } from './tools/CheckFormat.js';

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
				} catch (error) {
                    console.error('❌ Invalid JSON recieved:', error);
                }
				const formatCheck = checkWebSocketMessageFormat(message);
                if (!formatCheck.valid) {
					console.log('❌ Bad message format received:', formatCheck.errors);
					this.disconnectWs(ws, 1007, "Invalid message format");
					return;
				}
				if (message.type !== 'input' && message.type !== 'auth') {
					console.log('Message received :', message);
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

    async handleMessage(ws, message) {
        switch(message.type) {
            case 'ping':
                this.pong(ws);
                break;
            case 'auth':
                await this.authenticateUser(ws, message.token, message.gameId);
                break;
            case 'input':
                break;
			case 'start':
				break;
            default:
                console.warn("⚠️ Type not recognized : ", message.type);
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

	disconnectWs(ws, code, reason) {
		const userId = gameMaster.getUserIdByWs(ws);
		// Remove from unknown clients if present
		this.unknownClients = this.unknownClients.filter(c => c !== ws);
		if (ws.readyState === 1) {
			ws.close(code, reason);
			if (userId)
				console.log(`🔴 Ws ${userId} has been disconnected: ${code} - ${reason}`);
			else
				console.log(`🔴 Unregistered ws has been disconnected: ${code} - ${reason}`);
		} else {
			console.warn("❌ Cannot close WebSocket: already closed");
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

    async authenticateUser(ws, token, gameId) {
		
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
		console.log(`Message recieved: auth, from ${data.slug}, for game ${gameId}`);

        if (gameMaster.addUserToGame(ws, data.idUser, gameId) == false) {
			console.error("❌ Game not found or not enough players");
			ws.close(4003, "Game not found or not enough players");
			return ;
		}
		const players = gameMaster.getPlayersByGameId(gameId);
		if (!players || players.length != 2) {
			console.error("❌ Game not found or not enough players");
			ws.close(4003, "Game not found or not enough players");
			return ;
		} else {
			this.sendToWs(ws, {
				type: 'auth_success',
				gameId: gameId,
				playerA: players[0],
				playerB: players[1]
			});
		}
    }
}