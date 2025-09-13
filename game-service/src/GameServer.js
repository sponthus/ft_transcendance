import { gameEventEmitter } from "./GameEventEmitter.js";
import { PongGame } from "./pongGame.js";
import GameMaster from "./GameMaster.js";

// Handles game logic for one game actually running
export default class GameServer {
    
    constructor(gameId, tournamentId, userId, ws, maxScore, ai, option) {
        this.gameId = gameId;
		this.tournamentId = tournamentId;
        this.userId = userId;
        this.ws = ws;
        this.state = 'paused';
        this.maxScore = maxScore;
        console.log("Game server up");

        this.scoreA = 0;
        this.scoreB = 0;
        this.end = false;

        this.startGame();
        // à chaque tick du serveur
        const game = new PongGame(this.gameId, ai, option);
        this.intervalId = setInterval(() => {
            // Appliquer les inputs pour déplacer le paddle
            game.update();
            // broadcast du nouvel état
            const stateMsg = JSON.stringify({
                type: "stateUpdate",
                gameState: game.getState()
            });
            this.scoreA = game.getState().score.s1;
			this.scoreB = game.getState().score.s2;
            // balance le message a tout les players connecté
            if (this.ws.readyState === 1) {
				this.ws.send(stateMsg);
			} else {
				console.log("❌ Unable to send game state");
            }
                if ((this.scoreA >= this.maxScore || this.scoreB >= this.maxScore) && this.end === false) {
                this.end = true;
				this.endGame();
            }
        }, 16); // 60fps
			
		this.setHandlers(game);
    }

    setHandlers(game) {
        this.ws.on('close', () => {
            gameEventEmitter.emitGameEvent('player:disconnected', this.gameId, {
				tournamentId: this.tournamentId
			});
            this.destroy();
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
					game.setInputs(data.playerId, data.input);
					break;

				case "gameMode":
					game.setGameMode(data.mode, data.option);
					break;

				case "ping":
					if (this.ws.readyState === 1)
						this.ws.send(JSON.stringify({ type: 'pong' }));
					else
						console.log(" ❌ Websocket not available for pong")
					break;

				default:
					console.warn("ERR: Type inconnu :", data.type);
			}
		});
    }

    startGame() {
        this.state = 'playing';
        gameEventEmitter.emitGameEvent('game:started', this.gameId, {
			tournamentId: this.tournamentId
		});
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
        this.state = 'finished';
        gameEventEmitter.emitGameEvent('game:ended', this.gameId, {
            scoreA: this.scoreA,
            scoreB: this.scoreB
        });
        this.destroy();
    }

    destroy() {
        clearInterval(this.intervalId);
        GameMaster.getInstance().endServer(this.userId);
    }
}