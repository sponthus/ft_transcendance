// TODO: Add messages handling

import { getAllUsers } from "./GetUsers.js";

export default class WebSocketManager {
    constructor(wss, fastify) {
        this.ws = wss;
		this.fastify = fastify;
		this.clients = new Map();
		this.unknownClients = [];
    }

	// Get existing users at the launch of the manager and register them
	async getBaseInfos() {
		const result = await getAllUsers();
		if (!result.ok) {
			throw new Error("Unable to get existing users");
		}
		const users = result.data;
		for (const user of users) {
			this.registerUser(null, user.userId, user.username, user.slug, "disconnected");
		}
	}

	async initializeWebSocket() {
		this.ws.on('connection', (ws, request) => {
            console.log('🟢 New WebSocket connection');

			this.handleConnection(ws);

			ws.on('message', (data) => {
                let message;
				try {
                    message = JSON.parse(data);
					// TODO: Add a handler for messages that do not contain "type" 
                    // = 1007 error, do not print token in logs
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
                this.handleDisconnexion(ws);
            });

			ws.on('error', (error) => {
                console.warn('❌ WebSocket error:', error);
                this.handleDisconnexion(ws);
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
                this.authenticateUser(ws, message.token);
                break;
			default:
				console.warn("⚠️ Type not recognized");
		}
	}

	pong(ws) {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'pong' }));
            console.log('Sent pong response');
        } else
			console.error("❌ Unable to send pong back");
    }

	getUserIdByWs(targetWs) {
        for (const [userId, client] of this.clients.entries()) {
            if (client.ws === targetWs) {
                return userId;
            }
        }
        return null;
    }

	isUserConnected(userId) {
        const client = this.clients.get(Number(userId));
        return client && client.status !== 'disconnected';
    }

	handleDisconnexion(ws) {
        const userId = this.getUserIdByWs(ws);
        if (userId) {
            if (!this.isUserConnected(Number(userId))) {
				console.warn(`User ${userId} not connected when trying to disconnect`);
				return;
			}
			const client = this.clients.get(Number(userId));
			client.status = 'disconnected';
			client.currentGame = 0;
			client.ws = null;
        } else {
			console.log("Disconnexion of a non-logged-in user");
		}
    }

	async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// At connexion, ws is registered, if not authenticated after 10s it is closed
	handleConnection(ws) {
		this.unknownClients.push(ws);
		
		// Execute once after 10s: check if ws has auth
		setTimeout(() => {
			if (this.getUserIdByWs(ws) == null) {
				ws.close(4001, "Authentication timeout");
			} else {
				this.unknownClients = this.unknownClients.filter(c => c !== ws);
			}
		}, 10000);
	}

	// Once auth is ok, register the ws in the clients map
    registerUser(ws, userId, username, slug, status) {
		if (this.clients.has(Number(userId))) {
			const client = this.clients.get(userId);
			client.ws = ws;
			client.status = status;
			client.currentGame = 0;
			client.username = username;
			client.slug = slug;
			console.log(`✅ Known user authenticated: ${userId} (${username})`);
		} 
		else {
			this.clients.set(Number(userId), {
				ws,
				username: username,
				status: status,
				currentGame: 0,
				messages: []
			});
			console.log(`✅ New user authenticated: ${userId} (${username})`);
		}
    }

	// Decode JWT token from auth message
	authenticateUser(ws, token) {
		try {
            const data = this.fastify.jwt.verify(token);
            const { idUser, username, slug } = data;
            this.registerUser(ws, idUser, username, slug, "online");
        } catch (err) {
            console.error("❌ Invalid token:", err.message);
            ws.close(4002, "Invalid authentication");
        }
	}

	getUserStatusBySlug(slug) {
		for (const [userId, client] of this.clients.entries()) {
            if (client.slug === slug) {
                return client.status;
            }
        }
		console.log(`User ${slug} is not found`);
        return 'not found';
    }

	getUserStatusByUserId(userId) {
		const client = this.clients.get(Number(userId));
        if (!client) {
            console.log(`User ${userId} is not found`);
            return 'not found';
        }
        console.log(`User ${userId} is ${client.status}`);
        return client.status;
	}
}
