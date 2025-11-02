import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import * as ADDONS from "@babylonjs/addons"
import "@babylonjs/loaders/glTF";
import { BasePage } from "../pages/BasePage.js";
import { renderScene } from "./displaying/renderScene.js";
import { renderMap } from "./displaying/renderMap.js";
import { renderAnimation } from "./displaying/animations.js";	
import { PlayerInput } from "./displaying/inputController.js";
import { renderGround } from "./displaying/renderGround.js";
import { renderAsset } from "./displaying/renderAsset.js";
import { sleep } from "./displaying/dialogueBox.js";
import { cleanBanner} from "../pages/Banner.js";
import { ErrorPopup } from "../pages/ErrorPage.js";
import { BabylonSceneCache } from "./Cache/LoadSceneWithCache.js";
import { BabylonAssetCache } from "./Cache/LoadAssetWithCache.js";

export class Game extends BasePage {

	private	_renderScene?: renderScene;

	private	_renderAsset?: renderAsset;
	private	_renderMap?: renderMap;
	private	_renderGround?: renderGround;
	private _animation?: renderAnimation;

	private _input?: PlayerInput;
	private _slug: string;

	/***********dropdown menu************/

	constructor(slug: string) {
		super();
		this._slug = slug;
	}

	async render(): Promise<void>  {
		await this.renderBanner();
		try {
			this._renderScene = new renderScene(this.app);
			await this._renderScene.start();
	
			
			if (this._renderScene.homeScene && !this._renderScene.homeScene.isDisposed) {
				this._renderAsset = new renderAsset(this._renderScene.homeScene);
				await this._renderAsset._load();
				if (!this._renderScene.homeScene.isDisposed) {
					this._animation =  new renderAnimation(this._renderScene.homeScene, this._renderAsset);
					this._animation.startidle();
					this._animation.startidlenpc();
				}
				if (!this._renderScene.homeScene.isDisposed) 
					this._renderMap = new renderMap(this._renderScene.homeScene,  this._renderAsset.LoadedMap);
		
				if (!this._renderScene.homeScene.isDisposed) {
					this._renderGround = new renderGround(this._renderScene.homeScene);
					await this._renderGround._loadground();
				}
		
				if (!this._renderScene.homeScene.isDisposed && this._renderAsset && this._animation)
					this._input = new PlayerInput(this._renderScene.homeScene, this._renderAsset, this._animation, this._renderScene);
			}

			await sleep(3000);
			if (this._renderScene.engine)
				this._renderScene.engine.hideLoadingUI(); 
		}
		catch(Error) {
			await ErrorPopup(Error as string);
		}
	}

	destroy(): void {
		this.banner.innerHTML = '';
		this.app.innerHTML = '';
		document.body.style.overflow = "";
		document.documentElement.style["overflow"] = "";
		document.documentElement.style.overflow = "";
		cleanBanner();
		if (this._renderAsset)
			this._renderAsset.destroy();
		if (this._renderGround)
			this._renderGround.destroy();
		if (this._renderScene) {
			BabylonSceneCache._clearCacheScene();
			if (this._renderScene.engine && !this._renderScene.engine.isDisposed) {
				this._renderScene.engine.stopRenderLoop();
			}
			if (this._renderScene.PongGame && this._renderScene.PongGame.GamePhysics)
				this._renderScene.PongGame.GamePhysics.stopGame();
		}
	}

	get renderScene() {
		return this._renderScene;
	}
}

