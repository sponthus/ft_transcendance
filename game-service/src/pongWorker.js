import { parentPort, workerData } from 'worker_threads';
import { PongGame } from './pongGame.js';
import { gameEventEmitter } from "./GameEventEmitter.js";

class PongWorker {
	constructor(gameId, ai, option, qtable, tournamentId, userId, maxScore) {
		this.gameId = gameId;
		this.tournamentId = tournamentId;
		this.maxScore = maxScore;
		this.userId = userId;
		this.state = 'paused';
		this.game = new PongGame(gameId, ai, option, qtable);

		this.scoreA = 0;
		this.scoreB = 0;
		this.end = false;
	}

	setInputs(input) {
		this.game.setInputs(input);
	}

	startGame() {
		this.state = 'playing';
		gameEventEmitter.emitGameEvent('game:started', this.gameId, {
			tournamentId: this.tournamentId,
			userId: this.userId
		});
		
		// à chaque tick du serveur
		let tick = 0;
		let action = 2; // 0 = UP, 1 = DOWN, 2 = STILL (default 1st action)
		let ticks_per_decision = 30; // 1 / 0.016 = 62.5
		// console.debug("Ticks per decision : ");
		// console.debug(ticks_per_decision);
		this.intervalId = setInterval(() => {
			// console.log("Tick ", tick);
			// Appliquer les inputs pour déplacer le paddle
			if (tick % ticks_per_decision == 0) {
				// console.log("Decision tick ", tick);
				// console.log("Main action is ", action);
				action = this.game.update(action, true);
			}
			else
				action = this.game.update(action);
			let gameState = this.game.getState();
			// broadcast du nouvel état
			this.scoreA = gameState.score.s1;
			this.scoreB = gameState.score.s2;
			// balance le message a tout les players connecté
			if ((this.scoreA >= this.maxScore || this.scoreB >= this.maxScore) && this.end === false) {
				this.endGame();
				return ;
			}
			parentPort.postMessage({ type: 'stateUpdate', state: gameState});
			tick++;
		}, 33); // 60fps = 16ms
	}

	endGame() {
		this.end = true;
		this.state == "finished";
		clearInterval(this.intervalId);
		let winner = '';
		if (this.scoreA == this.maxScore || this.scoreB == this.maxScore) {
			if (this.scoreA > this.scoreB)
				winner = 'A'
			else if (this.scoreB > this.scoreA)
				winner = 'B'
			else
				winner = '='
		} else
			winner = '0'
        gameEventEmitter.emitGameEvent('game:ended', this.gameId, {
            scoreA: this.scoreA,
            scoreB: this.scoreB
        });
		if (this.tournamentId != 0) {
			gameEventEmitter.emitTournamentEvent('tournament:endgame', this.tournamentId, {
				gameId: this.gameId
			});
		}
		parentPort.postMessage({ 
			type: 'endGame', 
			winner: winner, 
			scoreA: this.scoreA, 
			scoreB: this.scoreB 
		});
		process.exit(0);
    }

	disconnect() {
		clearInterval(this.intervalId);
		process.exit(0);
	}

}

const pongWorker = new PongWorker(
	workerData.gameId, 
	workerData.ai, 
	workerData.option, 
	workerData.qtable,
	workerData.tournamentId,
	workerData.userId,
	workerData.maxScore
);

parentPort.on('message', (msg) => {
    if (msg.type === 'input') {
        pongWorker.setInputs(msg.input);
    }
	else if (msg.type === 'start') {
		pongWorker.startGame();
	}
	else if (msg.type === 'stop') {
		pongWorker.endGame();
	}
	else if (msg.type === 'disconnect') {
		pongWorker.disconnect();
	}
});