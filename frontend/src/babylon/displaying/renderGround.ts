/*****************************************************************export class for rendering ground and water*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as BABYLON_MATERIALS from "@babylonjs/materials";

export class renderGround {

	private _scene: BABYLON.Scene;
	private _ground?: BABYLON.Mesh;
	private _waterMaterial?: BABYLON_MATERIALS.WaterMaterial;
	private _skybox?: BABYLON.Mesh;
	private _skyboxMaterial?: BABYLON.StandardMaterial;

	constructor(scene: BABYLON.Scene) {
		this._scene = scene;
	}

	async _loadground() {
		await this._initGround();
		await this._makingSkybox();
		await this._renderWater();	
	}

	private async _makingSkybox() : Promise<void> {
		/***************create and set up skybox************************/
		this._skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 150.0}, this._scene);
		if (!this._skybox)
			throw new Error("skybox failed to load");
		this._skyboxMaterial = new BABYLON.StandardMaterial("skybox_material", this._scene);
		if (!this._skyboxMaterial)
			throw new Error("skybox materials failed to load")
		this._skyboxMaterial.backFaceCulling = false;
		this._skyboxMaterial.disableLighting = true;
		// this._skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		// this._skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		this._skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/asset/skybox/skybox", this._scene, ["_px.png","_nx.png", "_py.png", "_ny.png", "_pz.png", "_nz.png"]);
		(this._skyboxMaterial.reflectionTexture as BABYLON.CubeTexture).onLoadObservable.add(() => {
			console.log("Skybox texture loaded successfully");
		});
	
		this._skybox.material = this._skyboxMaterial;
		this._skybox.infiniteDistance = true;
	}

	private async _initGround() {
		/*********create ground*************/
		this._ground = BABYLON.MeshBuilder.CreateGround("ground", {width: screen.width, height: screen.height, subdivisions: 64},this._scene);
		this._ground.position = new BABYLON.Vector3(5, -3, 5);
	}

	private async _renderWater(): Promise<void> {
		/***************create and set up water materials************************/
		this._waterMaterial = new BABYLON_MATERIALS.WaterMaterial("water_material", this._scene, new BABYLON.Vector2(100, 100));
		if (!this._waterMaterial)
			throw new Error("WaterMaterial failed to load");
		this._waterMaterial.bumpTexture = new BABYLON.Texture("/asset/pic/26672.jpg", this._scene);
		(this._waterMaterial.bumpTexture as BABYLON.Texture).onLoadObservable.add(() => {
			console.log("succesfully load Bump texture");
		});

		this._waterMaterial.bumpHeight = 9;
		this._waterMaterial.bumpAffectsReflection = true;
		this._waterMaterial.bumpSuperimpose = true;

		this._waterMaterial.windForce = 1;
		this._waterMaterial.waveHeight = 0.5;
		this._waterMaterial.waveLength = 0.05;
		this._waterMaterial.windDirection = new BABYLON.Vector2(-1, 0);
		
		this._waterMaterial.waterColor =  new BABYLON.Color3(0.1, 0.4, 1.4); //new BABYLON.Color3(0.0882353, 0.28627452, 0.48235294);
		this._waterMaterial.colorBlendFactor = 0.1;
		this._waterMaterial.alpha = 1.6; 
		this._waterMaterial.addToRenderList(this._skybox);
		if (this._ground && this._waterMaterial)
			this._ground.material = this._waterMaterial;
	}
}