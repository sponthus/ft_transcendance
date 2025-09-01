import State from './state.js';

const state = State.getInstance();

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
                    console.log('Message received : ', message);
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
        if (userId) {
            if (state.isUserConnected(userId)) {
                const oldClient = state.getClientByUserId(userId);
                console.log(`User ${userId} already connected, closing old connection`);
                oldClient.ws.close(1000, 'New session started');
            }
            state.addUser(ws, userId);
            // console.log("Authenticated user = " + userId);

            this.sendToUser(userId, {
                type: 'auth_success',
                userId: userId,
                timestamp: Date.now()
            });
        } else {
            console.warn('Authentication failed: no userId provided');
        }
    }

    handleDisconnection(ws) {
        const userId = state.getUserIdByWs(ws);
        if (userId) {
            state.disconnectUser(userId);
        }
    }

    sendToUser(userId, message) {
        const ws = state.getWsByUserId(userId);
        if (ws && ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify(message));
            console.log(`Message sent to user ${userId}:`, message.type);
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