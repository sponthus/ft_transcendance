import { gameEventEmitter } from "./GameEventEmitter.js";
import { PongGame } from "./pongGame.js";
import GameMaster from "./GameMaster.js";

// Handles game logic for one game actually running
export default class GameServer {
    
    constructor(gameId, tournamentId, userId, maxScore, ai, option) {
        this.gameId = gameId;
		this.tournamentId = tournamentId;
        this.userId = userId;
        this.ws = null;
        this.state = 'paused';
        this.maxScore = maxScore;
		this.ai = ai;
		this.option = option;
        console.log("🟢 Game server up");

        this.scoreA = 0;
        this.scoreB = 0;
        this.end = false;

		// this.statusId = setInterval(() => {
        //     console.log("I exist");
        // }, 600); // 60fps
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
		this.game = new PongGame(this.gameId, this.ai, this.option);
		this.setHandlers(this.game);
	}

    setHandlers(game) {
		console.log("Handlers are set");
        this.ws.on('close', () => {
            if (this.end == false) {
				gameEventEmitter.emitGameEvent('player:disconnected', this.gameId, {
					tournamentId: this.tournamentId
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
					tournamentId: this.tournamentId
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
			tournamentId: this.tournamentId
		});

        // à chaque tick du serveur
		let tick = 0;
		let action = 2; // 0 = UP, 1 = DOWN, 2 = STILL (default 1st action)
        let ticks_per_decision = Math.floor(1 / 0.016);
		console.log("Ticks per decision : ");
		console.log(ticks_per_decision);
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
			// broadcast du nouvel état
            const stateMsg = JSON.stringify({
                type: "stateUpdate",
                gameState: this.game.getState()
            });
            this.scoreA = this.game.getState().score.s1;
			this.scoreB = this.game.getState().score.s2;
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
        }, 16); // 60fps
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
        clearInterval(this.intervalId);
        GameMaster.getInstance().endServer(this.gameId);
    }
}