import { getAllUsers } from "./GetUsers.js";
import { checkWebSocketMessageFormat } from "./CheckWsFormat.js";

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
		if (users.length == 0)
			return ; 
		for (const user of users) {
			this.registerUser(null, user.id, user.username, user.slug, "disconnected");
		}
	}

	/*checkTokenFromCookies(cookies)
	{

	}*/

	async initializeWebSocket() {
		this.ws.on('connection', (ws, request) => {
            console.log('🟢 New WebSocket connection');

			this.checkTokenFromCookies(request.headers.cookies);
			//this.handleConnexion(ws);

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
				if (message.type !== 'auth')
					console.log('Message received :', message);
				else
					console.log('Auth message received');

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
	
	disconnectWs(ws, code, reason) {
		const userId = this.getUserIdByWs(ws);
        if (userId) {
            if (!this.isUserConnected(Number(userId))) {
				console.warn(`User ${userId} not registered when trying to disconnect`);
			}
			const client = this.clients.get(Number(userId));
			client.ws = client.ws.filter(sock => sock && sock.readyState === 1);
			if (client.ws.length == 0) {
				client.status = 'disconnected';
			}
		}
		if (ws.readyState === 1) {
			ws.close(code, reason);
			console.log(`🔴 User ${userId} has been disconnected: ${code} - ${reason}`);
		} else {
			console.warn("❌ Cannot close WebSocket: already closed");
		}

	}

	handleDisconnexion(ws) {
        const userId = this.getUserIdByWs(ws);
        if (userId) {
            if (!this.isUserConnected(Number(userId))) {
				console.warn(`User ${userId} not connected when trying to disconnect`);
				return;
			}
			const client = this.clients.get(Number(userId));
			client.ws = client.ws.filter(sock => sock && sock.readyState === 1);
			if (client.ws.length == 0) {
				client.status = 'disconnected';
				client.currentGame = 0;
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
	handleConnexion(ws) {
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
			if (ws)
				client.ws.push(ws);
			client.ws = client.ws.filter(sock => sock && sock.readyState === 1);
			client.status = status;
			client.currentGame = 0;
			client.username = username;
			client.slug = slug;
			console.log(`✅ Known user authenticated: ${userId} (${username}) / slug=${slug} / status=${status}`);
		} 
		else {
			this.clients.set(Number(userId), {
				ws: [ws],
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
		if (!token) {
            console.warn('Authentication failed: no token provided');
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
		
		const { idUser, username, slug } = data;
		let oldMessages = [];
		try {
			const client = this.getClientByUserId(idUser);
			if (client !== undefined) {
				oldMessages = client.messages;
			}
		} catch (error) {
			console.error("Error fetching old messages", error);
		}

		this.registerUser(ws, idUser, username, slug, "online");

		this.sendToWs(ws, {
			type: 'auth_success'
		});
		

		if (oldMessages.length > 0) {
            this.sendStoredMessagesToUser(idUser);
        }
	}

	/************************** SETTERS **********************************/

	// Useful when a user changes his username or slug
	updateUserInfos(userId, username, slug) {
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
		console.log("Updating status of", userId, "with", status);
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
				if (wss && wss.readyState === 1) {
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
            if (this.sendToUserId(userId, {
					type: 'message',
					sender: sender,
					message: message}) == true) {
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
