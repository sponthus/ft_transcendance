/*****************************************************************export class for render scene*****************************************************************/
import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { PongGame } from "../pong/pong_game";
import { LoadingScreen } from "./loadingScreen";
import { popUp } from "../../Utils/popUp";
import { GamePage } from "../../pages/Game-Pages/GamePage";

enum state {HOME = 0, PONG = 1};

// function sleep(ms: number) {
// 	return new Promise(resolve => setTimeout(resolve, ms));
// }

export class renderScene {

	private _canvas: HTMLCanvasElement | null = null;
	private _engine: BABYLON.Engine | null = null;

	private _homeScene: BABYLON.Scene | null = null;
	private _pongScene: BABYLON.Scene | null = null;

	private _isocamera?: BABYLON.FreeCamera;
	private _light?: BABYLON.HemisphericLight;

	private _state!: number;

	// private _popUp?: popUp;
	private _gameCreatorPage?: GamePage;


	constructor(App: HTMLElement) {
		/**********************scene builder***********************/
		this._canvas = this._initCanvas(App);

		this._initEngine();
	
		this._homeScene = this._initScene();
		this._pongScene = this._initScene();
	
		this._initPongGame();
		this._initGravity();
		this._initIsoCamera();
		this._initLight();

		this._initState();

		this._initGameCreatorPage();
		// this._initPoPupPage();

		this._setdebugLayer();

		this._renderingloop();
		
	}

	private _initGameCreatorPage() {
		this._gameCreatorPage = new GamePage(this);
	}

	private _initState() {
		this._state = state.PONG;
	}

	private _initCanvas(App: HTMLElement): HTMLCanvasElement {
		/**********************canvas builder***********************/
		document.documentElement.style["overflow"] = "hidden";
		document.documentElement.style.overflow = "hidden";
		document.documentElement.style.width = "100%";
		document.documentElement.style.height = "100%";
		document.documentElement.style.margin = "0";
		document.documentElement.style.padding = "0";
		document.body.style.overflow = "hidden";
		document.body.style.width = "100%";
		document.body.style.height = "100%";
		document.body.style.margin = "0";
		document.body.style.padding = "0";
		//create the canvas html element and attach it to the webpage
		this._canvas = document.createElement("canvas");
		if (!this._canvas)
			throw new Error("Canvas failed to load");
		this._canvas.style.width = "100%";
		this._canvas.style.height = "100%";
		this._canvas.id = "gameCanvas";
		App.appendChild(this._canvas);

		console.log("Canvas create and add to DOM");
		return this._canvas;
	}

	private async _initPongGame(): Promise<void> {
		const pong = new PongGame();
		if (!pong)
			throw new Error("pongGame failed to load");
		await pong.start(this.pongScene!, this.canvas!, this.engine!)
	}

	private _initScene(): BABYLON.Scene {
		const scene: BABYLON.Scene = new BABYLON.Scene(this._engine!);
		if (!scene)
			throw new Error("scene failed to Load");
		scene.autoClear = true;
		scene.autoClearDepthAndStencil = true;
		scene.blockMaterialDirtyMechanism = true;
		return scene;
	}

	private _initEngine() {
		this._engine = new BABYLON.Engine(this._canvas, true);
		if (!this._engine)
			throw new Error("Engine Failed to load");
		// var loadingScreen = new LoadingScreen(this.canvas!);
		// if (this.engine)
		// 	this.engine.loadingScreen = loadingScreen;
	}

	private _initIsoCamera() {
		this._isocamera = new BABYLON.FreeCamera("isocamera", new BABYLON.Vector3(2, 15, -20), this._homeScene!);
		if (!this._isocamera)
			throw new Error("isoCamera failed to load");
		this._isocamera.position = new BABYLON.Vector3(2, 15, -20);
		this._isocamera.mode = BABYLON.FreeCamera.ORTHOGRAPHIC_CAMERA;
		this._isocamera.setTarget(BABYLON.Vector3.Zero());
		this._isocamera.minZ = 0.1; 

		const zoom: number = 0.000012 * screen.width; // evantually to change with Dell machines
		console.log('zoom :', zoom);
		this._isocamera.orthoLeft = (-this._engine!.getRenderWidth() * zoom);
		this._isocamera.orthoRight = (this._engine!.getRenderWidth() * zoom);
		this._isocamera.orthoTop = (this._engine!.getRenderHeight() * zoom);
		this._isocamera.orthoBottom =( -this._engine!.getRenderHeight() * zoom);
		this._isocamera.detachControl();
		// /***************************for debug to delete at end of project***************************/
		// this._isocamera.attachControl(this._canvas, true);
		// if (this._homeScene)
		// 	this._homeScene.activeCamera = this._isocamera;
	}

	private _initLight() {
		this._light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this._homeScene!);
		if (!this._light)
			throw new Error("light failed to load");
	}

	private _initGravity() {
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

	private _renderingloop() {
		let lastTime = 0;
		const targetFPS = 120;
		const frameDuration = 1000 / targetFPS;
		let now;
		let delta;

		this._engine!.runRenderLoop(() =>  {
			now = performance.now();
			delta = now - lastTime;
			if (delta >= frameDuration) {
				lastTime = now;
				switch (this._state) {
					case state.HOME:
						if (this._homeScene)
							this._homeScene.render();
						break;
					case state.PONG:
						this.renderPongscene();
						break;
					default:break;
				}
			}
		});

		window.addEventListener('resize', () => {
		    this._engine!.resize();
			// location.reload();
		});
	}

	private renderPongscene() {
		this.engine?.stopRenderLoop();
		this._gameCreatorPage?.renderGamePage();
	}

	/***************************for debug to delete at end of project***************************/
	private _setdebugLayer() {
		console.log("Debug layer:", this._homeScene?.debugLayer);
		window.addEventListener('keydown', (ev) => {
			if (ev.shiftKey && ev.ctrlKey && ev.altKey &&(ev.key == "i" || ev.key == "I")) {
				if (this._homeScene!.debugLayer.isVisible())
					this._homeScene!.debugLayer.hide();
				else
					this._homeScene!.debugLayer.show(); }
		});
	}

	callRenderLoop() {
		this._renderingloop();
	}
}