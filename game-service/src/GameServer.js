import { gameEventEmitter } from "./GameEventEmitter.js";
import { PongGame } from "./pongGame.js";
import GameMaster from "./GameMaster.js";

// Handles game logic for one game actually running
export default class GameServer {
    
    constructor(gameId, tournamentId, userId, maxScore, ai, option, qtable) {
        this.gameId = gameId;
		this.tournamentId = tournamentId;
        this.userId = userId;
        this.ws = null;
        this.state = 'paused';
        this.maxScore = maxScore;
		this.ai = ai;
		this.option = option;
		if (ai != 0) {
			this.qtable = qtable;
		}
        console.log("🟢 Game server up");

        this.scoreA = 0;
        this.scoreB = 0;
        this.end = false;

		// this.statusId = setInterval(() => {
        //     console.log("I exist");
        // }, 6000);
    }

	sendToWs(ws, message, log) {
		if (ws.readyState == 1) {
			ws.send(JSON.stringify(message));
			if (log)
				console.log(`Message sent to socket:`, message);
		} else {
			console.warn(`❌ Cannot send message to socket: disconnected`);
		}
	}

	addWs(ws) {
		if (this.ws) {
			console.error(`Game already has a ws`);
			return;
		}
		this.ws = ws;
		if (this.ai != 0)
			this.game = new PongGame(this.gameId, this.ai, this.option, this.qtable);
		else
			this.game = new PongGame(this.gameId, this.ai, this.option);
		this.setHandlers(this.game);
	}

    setHandlers(game) {
		// console.debug("Handlers are set");
        this.ws.on('close', () => {
            if (this.end == false) {
				gameEventEmitter.emitGameEvent('player:disconnected', this.gameId, {
					tournamentId: this.tournamentId,
					userId: this.userId
				});
				this.destroy();
			}
        });

		this.ws.on("message", (msg) => {
			let data;

			try
			{
				data = JSON.parse(msg);
			}
			catch (err)
			{
				console.error("ERR: JSON :", msg);
				return;
			}

			switch (data.type) {
				case "input":
					game.setInputs(data.input);
					break;

				case "start":
					this.startGame();
					break;
				
				case "ping":
					this.pong(this.ws);
					break;

				default:
					console.warn("ERR: Type inconnu :", data.type);
			}
		});

		this.ws.on('error', (error) => {
			if (this.end == false) {
				gameEventEmitter.emitGameEvent('player:disconnected', this.gameId, {
					tournamentId: this.tournamentId,
					userId: this.userId
				});
				this.destroy();
			}
		});
    }

	pong(ws) {
        if (ws.readyState === 1) {
            this.sendToWs(ws, { type: 'pong' });
        } else
			console.error("❌ Unable to send pong back");
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
        let ticks_per_decision = 62; // 1 / 0.016 = 62.5
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
            const stateMsg = JSON.stringify({
                type: "stateUpdate",
                gameState: gameState
            });
            this.scoreA = gameState.score.s1;
			this.scoreB = gameState.score.s2;
            // balance le message a tout les players connecté
            if (this.ws.readyState === 1) {
				this.ws.send(stateMsg);
			} else {
				console.log("❌ Unable to send game state");
			}
			if ((this.scoreA >= this.maxScore || this.scoreB >= this.maxScore) && this.end === false) {
                this.end = true;
				this.state == "finished";
				this.endGame();
            }
			tick++;
        }, 16); // 60fps = 16ms
    }

    endGame() {
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
		if (this.ws.readyState === 1) {
			this.ws.send(JSON.stringify({
                type: "endGame",
                winner: winner,
				scoreA: this.scoreA,
				scoreB: this.scoreB
            }));
		} else {
			console.log(" ❌ Unable to send endGame");
		}
        gameEventEmitter.emitGameEvent('game:ended', this.gameId, {
            scoreA: this.scoreA,
            scoreB: this.scoreB
        });
		if (this.tournamentId != 0) {
			gameEventEmitter.emitTournamentEvent('tournament:endgame', this.tournamentId, {
				gameId: this.gameId
			});
		}
        this.destroy();
    }

    destroy() {
		console.log("🛑 Destroying game server ", this.gameId);
        clearInterval(this.intervalId);
        GameMaster.getInstance().endServer(this.gameId);
    }
}