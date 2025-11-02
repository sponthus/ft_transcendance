/*****************************************************************export class for render scene*****************************************************************/
import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { PongGame } from "../pong/pong_game";
import { LoadingScreen } from "./loadingScreen";
import { GamePage } from "../../pages/Game-Pages/GamePage";
import { BabylonSceneCache } from "../Cache/LoadSceneWithCache";
import { BabylonEngineCache } from "../Cache/LoadEngineWithCache";


enum state {HOME = 0, PONG = 1};

export class renderScene {

	private _canvas: HTMLCanvasElement | null = null;
	private _engine: BABYLON.Engine | null = null;

	private _PongGame!: PongGame;

	private _homeScene: BABYLON.Scene | null = null;
	private _pongScene: BABYLON.Scene | null = null;

	private _isocamera?: BABYLON.FreeCamera;
	private _light?: BABYLON.HemisphericLight;

	private _state!: number;

	private _gameCreatorPage?: GamePage | null = null;


	constructor(App: HTMLElement) {
		/**********************scene builder***********************/
		this._initCanvas();
		if (this._canvas)
			App.appendChild(this._canvas);	
	}

	
	async start() {
		if (this.canvas)
			this._engine = BabylonEngineCache._LoadEngineWithCache("MAIN", this.canvas);
		if (this._canvas && this._engine) {
			var loadingScreen = new LoadingScreen(this._canvas);
			if (this._engine) {
				this._engine.loadingScreen = loadingScreen;
				this._engine.displayLoadingUI();
			}
		}
	
		this._homeScene = BabylonSceneCache._LoadSceneWithCache("HOME", this.engine!);
		this._pongScene = BabylonSceneCache._LoadSceneWithCache("PONG", this.engine!);
	
		await this._initPongGame();
		await this._initGravity();
		await this._initIsoCamera();
		await this._initLight();

		await this._initState();

		await this._initGameCreatorPage();

		this._renderingloop();
	}

	private async _initGameCreatorPage() {
		this._gameCreatorPage = new GamePage(this);
	}

	private async _initState() {
		this._state = state.HOME;
	}

	private _initCanvas() {
		/**********************canvas builder***********************/
		document.documentElement.style["overflow"] = "hidden";
		document.documentElement.style.overflow = "hidden";
		document.documentElement.style.width = "100%";
		document.documentElement.style.height = "100%";
		document.documentElement.style.margin = "0";
		document.documentElement.style.padding = "0";
		document.body.style.overflow = "scroll";
		document.body.style.width = "100%";
		document.body.style.height = "100%";
		document.body.style.margin = "0";
		document.body.style.padding = "0";

		this._canvas = BabylonEngineCache._loadCanvasWithCache("MAIN");

		return ;
	}

	private async _initPongGame(): Promise<void> {
		this._PongGame = new PongGame();
		if (!this._PongGame)
			throw new Error("PongGame failed to load");
		await this._PongGame.start(this.pongScene!, this.canvas!, this.engine!);
	}

	// private _initScene(): BABYLON.Scene {
	// 	const scene: BABYLON.Scene = new BABYLON.Scene(this._engine!);
	// 	if (!scene)
	// 		throw new Error("Scene failed to Load");
	// 	scene.autoClear = true;
	// 	scene.autoClearDepthAndStencil = true;
	// 	scene.blockMaterialDirtyMechanism = true;
	// 	return scene;
	// }

	// private _initEngine() {
	// 	this._engine = new BABYLON.Engine(this._canvas, true);
	// 	if (!this._engine)
	// 		throw new Error("Engine Failed to load");
	// 	var loadingScreen = new LoadingScreen(this.canvas!);
	// 	if (this.engine)
	// 		this.engine.loadingScreen = loadingScreen;
	// }

	private async _initIsoCamera() {
		if (this._homeScene && this._homeScene.cameras.length === 1)
			return ;
		this._isocamera = new BABYLON.FreeCamera("isocamera", new BABYLON.Vector3(2, 15, -20), this._homeScene!);
		if (!this._isocamera)
			throw new Error("IsoCamera failed to load");
		this._isocamera.position = new BABYLON.Vector3(2, 20, -20);
		this._isocamera.mode = BABYLON.FreeCamera.ORTHOGRAPHIC_CAMERA;
		this._isocamera.setTarget(BABYLON.Vector3.Zero());
		this._isocamera.minZ = 0.1; 

		const renderWidth = this._engine!.getRenderWidth();
		const renderHeight =  this._engine!.getRenderHeight();
		const aspect = renderWidth / renderHeight;
		
		const halfHeight = 22;
		const halfWidth = halfHeight * aspect;

		this._isocamera.orthoLeft   = -halfWidth;
		this._isocamera.orthoRight  =  halfWidth;
		this._isocamera.orthoTop    =  halfHeight;
		this._isocamera.orthoBottom = -halfHeight;
		// this._isocamera.detachControl();
		this._isocamera.attachControl();
	}

	private  async _initLight() {
		if (this._homeScene && this._homeScene.lights.length === 1)
			return ;
		this._light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this._homeScene!);
		if (!this._light)
			throw new Error("Light failed to load");
	}

	private async _initGravity() {
		if (this._homeScene) {
			this._homeScene.collisionsEnabled = true; // activation colision
			this._homeScene.gravity = new BABYLON.Vector3(0, -0.5, 0); // activation gravity
		}
	}

	get homeScene(): BABYLON.Scene | null {
		if (this._homeScene)
			return this._homeScene;
		return null;
	}

	get pongScene(): BABYLON.Scene | null {
		if (this._pongScene)
			return this._pongScene;
		return null;
	}
	
	get engine(): BABYLON.Engine | null {
		if (this._engine)
			return this._engine;
		return null;
	}
	
	get	canvas(): HTMLCanvasElement | null {
		if (this._canvas)
			return this._canvas;
		return null;
	}
	
	set setState(state: number) {
		this._state = state;
	}
	
	get state(): number | null {
		if (this._state)
			return this._state;
		return null;
	}

	get PongGame(): PongGame {
		return this._PongGame;
	}

	get GamePage(): GamePage | null{
		if (this._gameCreatorPage)
			return this._gameCreatorPage;
		return null;
	}
	
	private _renderingloop() {
		let lastTime = 0;
		const targetFPS = 120;
		const frameDuration = 1000 / targetFPS;
		let now;
		let delta;

		if (this._engine && !this._engine.isDisposed) {
			if (this._canvas)
				this._canvas.focus();
			this._engine.runRenderLoop(() =>  {
				now = performance.now();
				delta = now - lastTime;
				if (delta >= frameDuration) {
					lastTime = now;
					switch (this._state) {
						case state.HOME:
							if (this._homeScene && !this._homeScene.isDisposed)
								this._homeScene.render();
							break;
						case state.PONG:
							this.renderPongscene();
							break;
						default:break;
					}
				}
			});
		}

	}

	private renderPongscene() {
		this.engine?.stopRenderLoop();
		this._gameCreatorPage?.renderGamePage();
	}

	callRenderLoop() {
		this._renderingloop();
	}

}