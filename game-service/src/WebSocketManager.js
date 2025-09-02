import GameMaster from './GameMaster.js';

const gameMaster = GameMaster.getInstance();

export default class WebSocketManager {
    constructor(wss) {
        this.ws = wss;
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        this.ws.on('connection', (ws, request) => {
            console.log('New WebSocket connection');

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.type !== 'input')
                        console.log('Message received :', message);
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('Invalid JSON:', error);
                }
            });

            ws.on('close', () => {
                console.log('Connection closed');
                this.handleDisconnection(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnection(ws);
            });
        });
    }

    handleMessage(ws, message) {
        switch(message.type) {
            case 'ping':
                this.pong(ws);
                break;
            case 'auth':
                this.authenticateUser(ws, message.userId);
                break;
            // case 'join_game':
            //     this.handleJoinGame(ws, message.gameId);
            //     break;
            // case 'input':
            //     this.handlePlayerInput(ws, message);
            //     break;
        }
    }

    pong(ws) {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'pong' }));
            console.log('Sent pong response');
        }
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

    authenticateUser(ws, userId) {
        if (!userId) {
            console.warn('Authentication failed: no userId provided');
            return;
        }

        let oldMessages = [];
        const oldClient = gameMaster.getClientByUserId(userId);
        if (oldClient !== undefined) {
            console.log(`User ${userId} already connected, closing old connection`);
            // console.log(oldClient);
            if (oldClient.ws) {
                oldClient.ws.close(1000, 'New session started');
                oldClient.ws = null;
            }
            oldMessages = oldClient.messages;
            // console.log(oldMessages);
        }

        gameMaster.addUser(ws, userId);
        // console.log("Authenticated user = " + userId);
        this.sendToUser(userId, {
            type: 'auth_success',
            userId: userId,
            timestamp: Date.now()
        });

        // TODO = Check this part : socket is refreshed (page refresh) after msg has been sent
        if (oldMessages.length > 0) {
            gameMaster.sendListOfMessagesToUser(userId, oldMessages);
        }
    }

    handleDisconnection(ws) {
        const userId = gameMaster.getUserIdByWs(ws);
        if (userId) {
            gameMaster.disconnectUser(userId);
        }
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