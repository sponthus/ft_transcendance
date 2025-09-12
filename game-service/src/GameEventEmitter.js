import EventEmitter from 'node:events';

export class GameEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(15); // More simultaneous listeners
    }

    // Helper method to emit events with standard format
    emitGameEvent(eventType, gameId, data = {}) {
        const eventData = {
            gameId,
            timestamp: new Date(),
            ...data
        };

        this.emit(eventType, eventData);
    }

	emitTournamentEvent(eventType, tournamentId, data = {}) {
        const eventData = {
            tournamentId,
            timestamp: new Date(),
            ...data
        };

        this.emit(eventType, eventData);
    }
}

export const gameEventEmitter = new GameEventEmitter();