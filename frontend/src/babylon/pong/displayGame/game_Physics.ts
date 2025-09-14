import { Scene, Engine, Mesh, AbstractMesh, Vector3, ActionManager, ExecuteCodeAction, HemisphericLight } from "@babylonjs/core";
import { spawnImpactFX} from "./impactFX";
import { spawnExplosionFX } from "./impactFX";
import { crabmehamehaFX } from "./impactFX";
import { Score } from "./score";
import { Socket } from "../../../core/Socket";

interface BallMesh extends Mesh {
	direction: Vector3;
	speed: number;
}

export class GamePhysics {
	private _dt = 0.01666;
	private _gameMode = 1; // 0 = bot, 1 = qq1                                 a mettre dans constructeur
	private _gameOption = 1; // // 0 pong classique, 1 crabmeha, 2 4x4, 3 les 2    a mettre dans constructeur
	private _ball: BallMesh;
	private _scene: Scene;
	private _engine: Engine;
	private _crab1: AbstractMesh | null;
	private _crab2: AbstractMesh | null;
	private _menuPause: AbstractMesh | null;
	private _light: HemisphericLight;

	private _score!: Score;
	private _scoreValue1 = 0;
	private _scoreValue2 = 0;
	private _MaxScore: number = 0

	private _timeBobSpeak = 5;
	private _timeout = 5;

	private _spell1!: Vector3;
	private _spell2!: Vector3;

	private _serverState: any = null;

	private _Win: boolean = false;

	constructor(
		ball: BallMesh,
		scene: Scene,
		engine: Engine,
		crab1: AbstractMesh | null,
		crab2: AbstractMesh | null,
		menuPause: AbstractMesh | null,
		light: HemisphericLight
	) {
		this._ball = ball;
		this._scene = scene;
		this._engine = engine;
		this._crab1 = crab1;
		this._crab2 = crab2;
		this._menuPause = menuPause;
		this._light = light;
		this._score = new Score(this._scene, this._scoreValue1, this._scoreValue2);

		this._ball.speed = 0;
		console.log("win ? in game physics", this.Win);
		this.setupControls();
	}

	private setupControls()
	{
		const	playerId = "player1"; // prompt("t ki ? player1 ou player2 ?") || "player1";
		const	inputMap: Record<string, boolean> = {};
		const	socket = Socket.getInstance();
		if (!socket || !socket.ws)
			return;
		//const	socket = new WebSocket("ws://192.168.1.30:8080");

		this._scene.actionManager = new ActionManager(this._scene);

		this._scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
				inputMap[evt.sourceEvent.key.toLowerCase()] = true;
			})
		);

		this._scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, evt => {
				delete inputMap[evt.sourceEvent.key.toLowerCase()];
			})
		);
			socket.send(JSON.stringify({
				type: "gameMode",
				playerId: playerId,
				mode: this._gameMode,
				option: this._gameOption
			}));
				// envoie les inputs au serveur
			setInterval(() => {
				socket.send(JSON.stringify({ // traduire en JSON
					type: "input",
					playerId: playerId, // fixe pour test, à améliorer plus tard
					input: inputMap
				}));
			}, 33); // 30fps
		// stocke l’état serveur
		socket.ws.onmessage = (event) => {
			const data = JSON.parse(event.data); // Traduire en variable
			if (data.type == "pong")
			{
				console.log('Received pong from server');
				socket.clearHeartbeatTimeout();
				return;
			}
			if (data.type === "stateUpdate")
			{
				this._serverState = data.gameState;
				this.updateFrontend();
			}
			if (data.type === "endGame") {
				this._scoreValue1 = 0;
				this._scoreValue2 = 0;
				this._score.updateScore(this._scoreValue1, this._scoreValue2);
				this._Win = true;
			}
		};
	}

	private updateFrontend()
	{
		//  Si y’a un état reçu du serveur
		if (this._serverState)
		{
			this.pauseManager();
			this._ball.position.x = this._serverState.ball.x;
			this._ball.position.z = this._serverState.ball.z;
			this.moveCrab();
			
			this._timeBobSpeak -= this._dt;
			if (this._timeBobSpeak < 0)
			{
				this._timeBobSpeak = 5;
				this._score._drawSpeak();
			}
			if (this._scoreValue1 < this._serverState.score.s1 || this._scoreValue2 < this._serverState.score.s2)
			{
				this._scoreValue1 = this._serverState.score.s1;
				this._scoreValue2 = this._serverState.score.s2;
				this._score.updateScore(this._scoreValue1, this._scoreValue2);
				this._timeBobSpeak = 10;
			}
			this._spell1 = new Vector3(this._serverState.spell1.x , this._serverState.spell1.y, this._serverState.spell1.z);
			if (this._spell1.z > -9 || (this._spell1.z < -9 && this._serverState.specialCooldown1 < 0))
				crabmehamehaFX(this._scene, this._spell1);
			this._spell2 = new Vector3(this._serverState.spell2.x , this._serverState.spell2.y, this._serverState.spell2.z);
			if (this._spell2.z < 9 || (this._spell2.z > 9 && this._serverState.specialCooldown2 < 0))
				crabmehamehaFX(this._scene, this._spell2);

		}
	}

	private pauseManager()
	{
		if (this._menuPause)
		{
			if (this._serverState.ispaused === true)
			{
				this._light.intensity = 0.5;
				this._menuPause.setEnabled(true);
			}
			else
			{
				this._light.intensity = 1;
				this._menuPause.setEnabled(false);
			}
		}
	}

	private moveCrab()
	{
		if (this._crab1)
		{
			const targetPaddle1Pos = new Vector3(
			this._serverState.paddle1.x,
			this._crab1.position.y,
			this._crab1.position.z
			);
			this._crab1.position = Vector3.Lerp(this._crab1.position, targetPaddle1Pos, 0.3);

			if (this._serverState.die1 === true)
			{
				spawnExplosionFX(this._scene, this._crab1.position);
				this._crab1.position.y = -4;
			}
			else
				this._crab1.position.y = 0;
		}
		if (this._crab2)
		{
			const targetPaddle2Pos = new Vector3(
			this._serverState.paddle2.x,
			this._crab2.position.y,
			this._crab2.position.z
			);
			this._crab2.position = Vector3.Lerp(this._crab2.position, targetPaddle2Pos, 0.3);
			if (this._serverState.die2 === true)
			{
				spawnExplosionFX(this._scene, this._crab2.position);
				this._crab2.position.y = -4;
			}
			else
				this._crab2.position.y = 0;
		}
	}

	set setMaxScore(MaxScore: number) {
		this._MaxScore = MaxScore;
	}

	set SetWin(win: boolean) {
		this._Win = win;
	}

	get Win(): boolean {
		console.log("getter Win called, returning:", this._Win);
		return this._Win;
	}

	get Score1() : number {
		return this._scoreValue1;
	}

	get Score2() : number {
		return this._scoreValue2;
	}
}