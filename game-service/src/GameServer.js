import { gameEventEmitter } from "./GameEventEmitter.js";
import { PongGame } from "./pongGame.js";
import GameMaster from "./GameMaster.js";
import { parentPort } from 'worker_threads';

// Handles game logic for one game actually running
export default class GameServer {
    
    constructor(gameId, tournamentId, userId, maxScore, ai, option, qtable, worker) {
        this.gameId = gameId;
		this.tournamentId = tournamentId;
        this.userId = userId;
        this.ws = null;
        this.state = 'paused';
        this.maxScore = maxScore;
		this.ai = ai;
		this.option = option;
		this.worker = worker;
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
		// if (this.ai != 0)
		// 	this.game = new PongGame(this.gameId, this.ai, this.option, this.qtable);
		// else
		// 	this.game = new PongGame(this.gameId, this.ai, this.option);
		this.setHandlers(this.game);
		
	}

    setHandlers() {
		// console.debug("Handlers are set");
        this.ws.on('close', () => {
            if (this.end == false) {
				gameEventEmitter.emitGameEvent('player:disconnected', this.gameId, {
					tournamentId: this.tournamentId,
					userId: this.userId
				});
				this.worker.postMessage({ type: 'disconnect'});
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
					if (this.worker)
						this.worker.postMessage({ type: 'input', input: data.input });
					else
						console.error("ERR: No worker to process input");
					break;

				case "start":
					if (this.worker)
						this.worker.postMessage({ type: 'start' });
					else
						console.error("ERR: No worker to process input");
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
				this.worker.postMessage({ type: 'disconnect'});
			}
		});
    }

	pong(ws) {
        if (ws.readyState === 1) {
            this.sendToWs(ws, { type: 'pong' });
        } else
			console.error("❌ Unable to send pong back");
    }
}