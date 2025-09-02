import { gameEventEmitter } from './GameEventEmitter.js';

// Recieves events
class DatabaseEventHandler {
    constructor(DatabaseHandler) {
        this.DatabaseHandler = DatabaseHandler;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Watches for certain messages
        gameEventEmitter.on('game:started', this.handleGameStarted.bind(this));
        gameEventEmitter.on('player:disconnected', this.handlePlayerDisconnected.bind(this));
        gameEventEmitter.on('player:scored', this.handlePlayerScored.bind(this));
        gameEventEmitter.on('game:ended', this.handleGameEnded.bind(this));

        console.log('📊 Database event service listening');
    }

    async   handleGameStarted(eventData) {
        console.log('💾 Updating DB: Game started', eventData.gameId);

        try {
            await this.DatabaseHandler.updateGameStatus(eventData.gameId, 'ongoing');
            // await this.DatabaseHandler.recordGameEvent(eventData.gameId, 'game_started', eventData);
        } catch (error) {
            console.error('Error updating DatabaseHandler:', error);
            // Emit error event ?
            // EventEmitter.emitGameEvent('database:error', eventData.gameId, { error: error.message });
        }
    }

    async   handlePlayerDisconnected(eventData) {
        console.log('💾 Update DatabaseHandler: Disconnected player', eventData);

        await this.DatabaseHandler.updateGameStatus(eventData.gameId, 'canceled');
        // await this.DatabaseHandler.recordPlayerEvent(eventData.gameId, eventData.playerId, 'disconnected');
    }

    async   handlePlayerScored(eventData) {
        console.log('💾 Loading score:', eventData);

        await this.DatabaseHandler.updateScore(eventData.gameId, eventData.newScoreA, eventData.newScoreB);
        // await this.DatabaseHandler.recordGameEvent(eventData.gameId, 'player_scored', eventData);
    }

    async   handleGameEnded(eventData) {
        console.log('💾 Ending game in DatabaseHandler:', eventData.gameId);

        await this.DatabaseHandler.updateGameStatus(eventData.gameId, 'finished');
        await this.DatabaseHandler.updateScore(eventData.gameId, eventData.scoreA, eventData.scoreB);
        await this.DatabaseHandler.recordWinner(eventData.gameId);
    }
}

export default DatabaseEventHandler;