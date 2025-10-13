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
import { renderBaseBanner, renderLoggedInBanner} from "../pages/Banner.js";

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
		console.log('user slug in App :' , this._slug);
	}

	async render(): Promise<void>  {
		await this.renderBanner();
		try {
			this._renderScene = new renderScene(this.app);
			if (this._renderScene.engine)
				this._renderScene.engine.displayLoadingUI();
			
			if (this._renderScene.homeScene) {
				this._renderAsset = new renderAsset(this._renderScene.homeScene);
				await this._renderAsset._load();
				this._animation =  new renderAnimation(this._renderScene.homeScene, this._renderAsset);
				this._animation.startidle();
				this._animation.startidlenpc();
				this._renderMap = new renderMap(this._renderScene.homeScene,  this._renderAsset.LoadedMap);
		
				this._renderGround = new renderGround(this._renderScene.homeScene);
				await this._renderGround._loadground();
		
				this._input = new PlayerInput(this._renderScene.homeScene, this._renderAsset, this._animation, this._renderScene);

			}

			await sleep(3000);
			if (this._renderScene.engine)
				this._renderScene.engine.hideLoadingUI(); 
		} 
		catch(Error) {
			console.log("Error: ", Error);
		}
		// this._dropDown = new DropDownMenu(this._renderScene.scene!, this._slug);
	}
}

