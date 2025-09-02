import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import	{DropDownMenu } from "./menu/dropDownMenu";
import { BasePage } from "../pages/BasePage.js";
import { renderScene } from "./displaying/renderScene";
import { renderMap } from "./displaying/renderMap";
import { renderAnimation } from "./displaying/animations";	
import { PlayerInput } from "./displaying/inputController";
import { renderGround } from "./displaying/renderGround.js";
// import { Player } from "./displaying/characterController";
import { renderAsset } from "./displaying/renderAsset";
import { sleep } from "./displaying/dialogueBox";


export class Game extends BasePage {

	private	_renderScene?: renderScene;

	private	_renderAsset?: renderAsset;
	private	_renderMap?: renderMap;
	private	_renderGround?: renderGround;
	private _animation?: renderAnimation;

	private _input?: PlayerInput;
	private _slug: string;

	/***********dropdown menu************/
	private	_dropDown: DropDownMenu | null = null;

	constructor(slug: string) {
		super();
		this._slug = slug;
		console.log('user slug in App :' , this._slug);
	}

	async render(): Promise<void>  {
		//document.body.innerHTML = "";
		await this.renderBanner();
		try {
			this._renderScene = new renderScene();
			if (this._renderScene.engine)
				this._renderScene.engine.displayLoadingUI();

			if (this._renderScene.homeScene) {
				this._renderAsset = new renderAsset(this._renderScene.homeScene);
				await this._renderAsset._load();
				this._animation = new renderAnimation(this._renderScene.homeScene);
				this._animation.startidle();
				this._animation.startidlenpc();
				this._renderMap = new renderMap(this._renderScene.homeScene,  this._renderAsset.LoadedMap);
		
				this._renderGround = new renderGround(this._renderScene.homeScene);
				await this._renderGround._loadground();
		
				this._input = new PlayerInput(this._renderScene.homeScene, this._renderAsset, this._animation, this._renderScene);
			}

			await sleep(100);
			if (this._renderScene.engine)
				this._renderScene.engine.hideLoadingUI(); 
		} 
		catch(Error) {
			console.log("Error: ", Error);
		}
		// this._dropDown = new DropDownMenu(this._renderScene.scene!, this._slug);
	}
}

