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
            this.sendToWs(ws, { type: 'pong' });
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
			client.currentGame = 0;
			client.ws = client.ws.filter(wss => wss !== ws);
			if (client.ws.length == 0) {
				client.status = 'disconnected';
				console.log(`🔴 User ${userId} is disconnected`)
			}
        } else {
			console.log("🔴 Disconnexion of a non-logged-in user");
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
			client.ws.push(ws);
			client.status = status;
			client.currentGame = 0;
			client.username = username;
			client.slug = slug;
			console.log(`✅ Known user authenticated: ${userId} (${username}) / slug=${slug} / status=${status}`);
		} 
		else {
			this.clients.set(Number(userId), {
				ws: new Array(ws),
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
		let data = {};
		try {
            data = this.fastify.jwt.verify(token);
		} catch (err) {
			console.error("❌ Invalid token:", err.message);
			ws.close(4002, "Invalid authentication");
			return ;
		}
		
		const { idUser, username, slug } = data;
		let oldMessages = [];
		try {
			const client = this.getClientByUserId(idUser);
			if (client !== undefined) {
				console.log(`User ${idUser} already known`);
				oldMessages = client.messages;
			}
		} catch (error) {
			console.error("Error fetching old messages", error);
		}

		this.registerUser(ws, idUser, username, slug, "online");

		this.sendToWs(ws, {
			type: 'auth_success',
			userId: idUser,
			timestamp: Date.now()
		});
		

		if (oldMessages.length > 0) {
            this.sendStoredMessagesToUser(idUser);
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
			for (const wss of client.ws) {
				if (wss === targetWs) {
					return userId;
				}
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
		if (client.ws.length == 0) {
			console.warn(`User not connected while trying to send message `, message);
            return false;
		}
		let sent = false;
		for (const wss of client.ws) {
			try {
				if (wss.readyState === 1) {
					wss.send(JSON.stringify(message));
					console.log(`Message sent to user ${userId}:`, message);
					sent = true;
				} else {
					throw new Error("Socket not connected");
				}
			} catch (error) {
				console.warn(`❌ Cannot send message to one socket of user ${userId}:`, error);
			}
		}
		if (!sent) {
			console.warn(`⚠️ No active sockets for user ${userId} while trying to send`, message);
		}
		return sent;
    }

	// sendToWs(ws, message) {
	// 	if (ws && ws.readyState === 1) { // WebSocket.OPEN
    //         ws.send(JSON.stringify(message));
    //         console.log(`Message sent to ws:`, message);
    //         return true;
    //     } else {
    //         console.warn(`❌ Cannot send message to ws : not connected`);
    //         return false;
    //     }
	// }
	
	sendToWs(ws, message) {
		if (ws.readyState == 1) {
			ws.send(JSON.stringify(message));
			console.log(`Message sent to socket:`, message);
		} else {
			console.warn(`❌ Cannot send message to socket: disconnected`);
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

    sendStoredMessagesToUser(userId) {
        const client = this.getClientByUserId(userId);
        const messages = client.messages;
		client.messages = [];

		let count = 0;
        console.log(`messages to send ${messages.length}`);
        for (const message of messages) {
			let trMessage = JSON.parse(message);
			count += this.sendMessageToUser(userId, trMessage.sender, trMessage.message);
		}
		console.log(`Sent ${count} stored messages`);
    }
}
