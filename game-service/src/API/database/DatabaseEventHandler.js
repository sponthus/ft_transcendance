import { gameEventEmitter } from '../../GameEventEmitter.js';

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
		gameEventEmitter.on('tournament:endgame', this.handleTournamentGameEnded.bind(this));

        console.log('📊 Database event service listening');
    }

    async   handleGameStarted(eventData) {
        console.log('💾 Updating DB: Game started', eventData.gameId);

        try {
            this.DatabaseHandler.updateGameStatus(eventData.gameId, 'ongoing');
            if (eventData.tournamentId != null && eventData.tournamentId != 0) {
				const changeStatus = this.DatabaseHandler.updateTournamentStatus(eventData.tournamentId, 'ongoing_game');
				if (!changeStatus.ok) {
					console.error("❌ Could not update tournament status to ongoing_game: ", changeStatus.error);
				}
			}
			// await this.DatabaseHandler.recordGameEvent(eventData.gameId, 'game_started', eventData);
        } catch (error) {
            console.log("❌ Error while handling game start: ")
			console.log(error);
        }
    }

    async   handlePlayerDisconnected(eventData) {
        console.log('💾 Update DatabaseHandler: Disconnected player', eventData);

        try {
			this.DatabaseHandler.updateGameStatus(eventData.gameId, 'canceled');
			if (eventData.tournamentId != null && eventData.tournamentId != 0) {
				const cancel = this.DatabaseHandler.cancelTournament(eventData.tournamentId);
				if (!cancel.ok) {
					console.error("❌ Could not cancel tournament after player disconnection: ", cancel.error);
				}
			}
			// await this.DatabaseHandler.recordPlayerEvent(eventData.gameId, eventData.playerId, 'disconnected');
		} catch (error) {
			console.log("❌ Error while handling player disconnection: ")
			console.log(error);
		}
    }

    async   handlePlayerScored(eventData) {
        console.log('💾 Loading score:', eventData);

		try {
			this.DatabaseHandler.updateScore(eventData.gameId, eventData.scoreA, eventData.scoreB);
			// this.DatabaseHandler.recordGameEvent(eventData.gameId, 'player_scored', eventData);
		} catch (error) {
			console.log("❌ Error while handling player score: ")
			console.log(error);
		}
    }

    async   handleGameEnded(eventData) {
        console.log('💾 Ending game in DatabaseHandler:', eventData.gameId);

        try {
			this.DatabaseHandler.updateGameStatus(eventData.gameId, 'finished');
			this.DatabaseHandler.updateScore(eventData.gameId, eventData.scoreA, eventData.scoreB);
			this.DatabaseHandler.recordWinner(eventData.gameId);
		} catch (error) {
			console.log("❌ Error while handling end of game: ")
			console.log(error);
		}	
    }

	async handleTournamentGameEnded(eventData) {
		console.log('🔄 End of a tournament game in DatabaseHandler:', eventData.tournamentId);
	
		try {
			this.DatabaseHandler.endTournamentGame(eventData.tournamentId, eventData.gameId)
		} catch (error) {
			console.log("❌ Error while handling end of tournament game: ")
			console.log(error);
		}	
	}
}

export default DatabaseEventHandler;