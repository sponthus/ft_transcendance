import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import * as ADDONS from "@babylonjs/addons"
import "@babylonjs/loaders/glTF";
import	{DropDownMenu } from "./menu/dropDownMenu";
import { BasePage } from "../pages/BasePage.js";
import { renderScene } from "./displaying/renderScene";
import { renderMap } from "./displaying/renderMap";
import { renderAnimation } from "./displaying/animations";	
import { PlayerInput } from "./displaying/inputController";
import { renderGround } from "./displaying/renderGround.js";
import { renderAsset } from "./displaying/renderAsset";
import { sleep } from "./displaying/dialogueBox";
import { renderBaseBanner, renderLoggedInBanner} from "../pages/Banner";

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
		await this.renderBanner();
		try {
			this._renderScene = new renderScene(this.app);
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

				// /*******create HTMLMesh Banner**********/ /*****find way to use tqilwindcss with htmlmesh */
				// const BannerMesh = new ADDONS.HtmlMeshRenderer(this._renderScene!.homeScene);
				
				// const BannerMeshDiv = new ADDONS.HtmlMesh(this._renderScene!.homeScene, "banner-div-mesh");
				// BannerMeshDiv.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
				
				// const DivBanner = document.createElement('div');
				// DivBanner.className = 'h-full w-full';
				// renderBaseBanner(DivBanner);
				// await renderLoggedInBanner(DivBanner);

				// console.log("DivBanner HTML:", DivBanner.innerHTML);
				// BannerMeshDiv.setContent(DivBanner, window.innerWidth,  window.innerHeight / 400);
				// BannerMeshDiv.position.y = 28;
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

