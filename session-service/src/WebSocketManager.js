// TODO: Add messages handling

import { getAllUsers } from "./GetUsers.js";

export default class WebSocketManager {
    constructor(wss, fastify) {
        this.ws = wss;
		this.fastify = fastify;
		this.clients = new Map();
		this.unknownClients = [];
    }

	/********************************************* INITIALIZATION **************************************/
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

	/*************************** CONNECT / DISCONNECT ************************/
	
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
			const client = this.clients.get(Number(userId));
			client.ws = ws;
			client.status = status;
			client.currentGame = 0;
			client.username = username;
			client.slug = slug;
			console.log(`✅ Known user authenticated: ${userId} (${username}) / slug=${slug} / status=${status}`);
		} 
		else {
			this.clients.set(Number(userId), {
				ws,
				username: username,
				status: status,
				currentGame: 0,
				messages: []
			});
			console.log(`✅ New user authenticated: ${userId} (${username}) / slug=${slug} / status=${status}`);
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

	/************************** SETTERS **********************************/

	// Useful when a user changes his username or slug
	updateUserInfos(userId, username, slug) {
		console.log("launching with ", userId, username, slug);
		if (this.clients.has(Number(userId))) {
			const client = this.clients.get(Number(userId));
			client.username = username;
			client.slug = slug;
			console.log(`✅ User data modification : ${userId} (${username}) / slug=${slug}`);
			return {
				userId: userId,
				username: username,
				slug: slug
			};
		} 
		else {
			return null;
		}
	}

	updateUserStatus(userId, status) {
		console.log("launching with ", userId, status);
		if (this.clients.has(Number(userId))) {
			const client = this.clients.get(Number(userId));
			client.status = status;
			console.log(`✅ User status modification : ${userId} (${status})`);
			return {
				userId: userId,
				status: status
			};
		} 
		else {
			return null;
		}
	}

	/******************************* GETTERS ********************************/

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

	getClientByUserId(userId) {
        return this.clients.get(Number(userId));
    }

	/*************************************** MESSAGES LOGIC ***********************************/

	
    sendToUserId(userId, message) {
		const client = this.getClientByUserId(Number(userId));
		if (!client) {
			console.warn(`Unknown user when send message `, message);
			return false;
		}
        const ws = client.ws;
        if (ws && ws.readyState === 1) // WS open
		{
			try {
				ws.send(JSON.stringify(message));
				console.log(`Message sent to user ${userId}:`, message);
				return true;
			} catch (error) {
				console.warn(`❌ Cannot send message to connected user ${userId}: `, error);
				return false;
			}
        } else {
			console.warn(`User not connected while trying to send message `, message);
            return false;
        }
    }

	sendToWs(ws, message) {
		if (ws && ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify(message));
            console.log(`Message sent to ws:`, message);
            return true;
        } else {
            console.warn(`❌ Cannot send message to ws : not connected`);
            return false;
        }
	}
	
	sendMessageToUser(userId, sender, message) {
        const client = this.getClientByUserId(userId);
        if (!client) {
            return 2;
        }
        if (this.isUserConnected(Number(userId))) {
            if (this.sendToUserId(userId, JSON.stringify({
					type: 'message',
					sender: sender,
					message: message})) == true) {
				console.log(`Message sent to user ${userId}:`, message);
				return 0;
			} else {
				return 3; // Error sending, impossible without error because user is connected
			}
        } else {
            console.log(`User ${userId} is not connected or playing, storing the message`);
            client.messages.push(JSON.stringify({
                sender: sender,
                message: message,
            }));
            return 1;
        }
    }
}
