import EventEmitter from 'node:events';

export class GameEventEmitter extends EventEmitter {
	static instance = null;

    constructor() {
        super();
		GameEventEmitter.instance = this;
        this.setMaxListeners(15); // More simultaneous listeners
    }

	static getInstance() {
        if (!GameEventEmitter.instance) {
            GameEventEmitter.instance = new GameEventEmitter();
        }
        return GameEventEmitter.instance;
    }

    // Helper method to emit events with standard format
    emitGameEvent(eventType, gameId, data = {}) {
        const eventData = {
            gameId,
            ...data
        };

        this.emit(eventType, eventData);
    }

	emitTournamentEvent(eventType, tournamentId, data = {}) {
        const eventData = {
            tournamentId,
            ...data
        };

        this.emit(eventType, eventData);
    }
}

export const gameEventEmitter = GameEventEmitter.getInstance();