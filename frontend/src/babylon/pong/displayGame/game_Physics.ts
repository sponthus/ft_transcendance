import { Scene, Engine, Mesh, AbstractMesh, Vector3, ActionManager, ExecuteCodeAction, HemisphericLight } from "@babylonjs/core";
import { spawnImpactFX} from "./impactFX";
import { spawnExplosionFX } from "./impactFX";
import { crabmehamehaFX } from "./impactFX";
import { Score } from "./score";
import { GameSocket } from "../../../core/GameSocket.js";

import { AdvancedDynamicTexture, TextBlock} from "@babylonjs/gui/2D";
import { MeshBuilder } from "@babylonjs/core";

import { DisplayName } from "./display_name";
import { checkWebSocketMessageFormat } from "../../../core/GameSocket.js"; 

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
	private _bullBob: AbstractMesh | null;
	private _bullPatrick: AbstractMesh | null;
	private _menuPause: AbstractMesh | null;
	private _menuPauseSansCrab: AbstractMesh | null;
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

	private socket: GameSocket | null = null;
	private inputMap: Record<string, boolean> = {};
	private ready: boolean = false; // Is the backend server ready to launch game ?

	private _displayName!: DisplayName;
	private _pancartePlayer1: AbstractMesh | null;
	private _pancartePlayer2: AbstractMesh | null;
	private _displayCountBegin: Mesh;
	private _advancedTexture2: AdvancedDynamicTexture;
	private _text: TextBlock;

	constructor(
		ball: BallMesh,
		scene: Scene,
		engine: Engine,
		crab1: AbstractMesh | null,
		crab2: AbstractMesh | null,
		bullBob: AbstractMesh | null,
		bullPatrick: AbstractMesh | null,
		menuPause: AbstractMesh | null,
		menuPauseSansCrab: AbstractMesh | null,
		pancartePlayer1: AbstractMesh | null,
		pancartePlayer2: AbstractMesh | null,
		light: HemisphericLight
	) {
		this._ball = ball;
		this._scene = scene;
		this._engine = engine;
		this._crab1 = crab1;
		this._crab2 = crab2;
		this._bullBob = bullBob;
		this._bullPatrick = bullPatrick;
		this._menuPause = menuPause;
		this._menuPauseSansCrab = menuPauseSansCrab;
		this._light = light;
		this._pancartePlayer1 = pancartePlayer1;
		this._pancartePlayer2 = pancartePlayer2;

		this._score = new Score(this._scene, this._scoreValue1, this._scoreValue2, this._bullBob, this._bullPatrick);
		this._displayName = new DisplayName(this._scene, "player1", "player2", this._pancartePlayer1, this._pancartePlayer2);

		this._ball.speed = 0;
		console.log("win ? in game physics", this.Win);
		this.setupControls();

		this._displayCountBegin = MeshBuilder.CreatePlane("displayCountBegin", { size: 6 }, this._scene);
		this._displayCountBegin.position = new Vector3(0, 3, 0); // décalé au-dessus de ton mesh
		this._displayCountBegin.billboardMode = Mesh.BILLBOARDMODE_ALL;
		//this._plane2.rotation = new Vector3(0, Math.PI, 0); // 180° sur Y

		// GUI sur le plane
		this._advancedTexture2 = AdvancedDynamicTexture.CreateForMesh(this._displayCountBegin);
		this._text = new TextBlock();
		this._text.text = "";
		this._text.color = "black";
		this._text.fontSize = 360;
		this._text.fontFamily = "Comic Sans MS";
		this._text.fontStyle = "italic";
		this._text.fontWeight = "bold";

		this._advancedTexture2.addControl(this._text);
	}

	public launchSocket(gameId: number) {
		this.socket = new GameSocket(gameId);
		if (!this.socket) {
			throw new Error("Error creating socket");
			return ;
		}

		// stocke l’état serveur
		this.socket.ws.onmessage = (event) => {
			let data: any;; 
			try {
				data = JSON.parse(event.data);
			} catch (error) {
				console.error('Error parsing JSON message.');
				this.socket!.close(3000, 'Invalid message format');
				return;
			}
			const checkFormat = checkWebSocketMessageFormat(data);
			if (checkFormat.valid === false) {
				console.error("Invalid WebSocket message format:", checkFormat.errors);
				this.socket!.close(3000, 'Invalid message format');
				return;
			}
			if (data.type =="gameMode")
			{
				if (data.ai == 0)
					this._gameMode = 1;
				else
					this._gameMode = 0;
				this._gameOption = data.option;
				return;
			}
			if (data.type == "auth_success")
			{
				this.ready = true;
				this.socket?.setPlaying(true);
				this.socket!.send(JSON.stringify({
					type: "start"
				}));
				this._displayName.setNamePlayers(data.playerA, data.playerB);
				return;
			}
			
			if (data.type == "pong")
			{
				console.log('Received pong from server');
				this.socket?.clearHeartbeatTimeout();
				return;
			}
			if (data.type === "stateUpdate")
			{
				this._serverState = data.gameState;
				this.updateFrontend();
				return;
			}
			if (data.type === "endGame") {
				this.socket?.setPlaying(false);
				this._scoreValue1 = 0;
				this._scoreValue2 = 0;
				this._score.updateScore(this._scoreValue1, this._scoreValue2);
				this._Win = true;
				return;
			}
		};

		// envoie les inputs au serveur
		setInterval(() => {
			if (this.ready) {
				this.socket?.send(JSON.stringify({ // traduire en JSON
					type: "input",
					input: this.inputMap
				}));
			}
		}, 33); // 30fps
	}

	public isSocketOpen(): boolean {
		if (this.socket && (this.socket.ws.readyState === WebSocket.OPEN || this.socket.ws.readyState === WebSocket.CONNECTING)) {
			return true;
		}
		return false;
	}

	public stopGame() {
		// this.socket?.setPlaying(false);
		if (this.socket)
			this.socket.close(1000, "Game ended");
		this.ready = false;
	}

	private setupControls()
	{
		// const	playerId = "player1"; // prompt("t ki ? player1 ou player2 ?") || "player1";

		this._scene.actionManager = new ActionManager(this._scene);

		this._scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
				this.inputMap[evt.sourceEvent.key.toLowerCase()] = true;
			})
		);

		this._scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, evt => {
				delete this.inputMap[evt.sourceEvent.key.toLowerCase()];
			})
		);
	}

	private updateFrontend()
	{
		//  Si y’a un état reçu du serveur
		if (this._serverState)
		{
			this.pauseManager();
			this.displayCountBegin();
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
				this._timeBobSpeak = 5;
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
		if (this._menuPause && this.ready)
		{
			if (this._serverState.ispaused === true)
			{
				this._light.intensity = 0.5;
				if (this._serverState.gameOption === 1)
					this._menuPause.setEnabled(true);
				else
					this._menuPauseSansCrab?.setEnabled(true);
			}
			else
			{
				this._light.intensity = 1;
				this._menuPause.setEnabled(false);
				this._menuPauseSansCrab?.setEnabled(false);
			}
		}
	}

	private displayCountBegin()
	{
		if (this._serverState.timePauseBegin > 0)
		{
			if (this._serverState.timePauseBegin < 6)
			{
				this._text.text = "1";
			}
			else if (this._serverState.timePauseBegin < 12)
			{
				this._text.text = "2";
			}
			else if (this._serverState.timePauseBegin < 18)
			{
				this._text.text = "3";
			}
		}
		else
		{
			this._text.text = "";
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
		return this._Win;
	}

	get Score1() : number {
		return this._scoreValue1;
	}

	get Score2() : number {
		return this._scoreValue2;
	}
}