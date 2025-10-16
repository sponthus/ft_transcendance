/*****************************************************************export class for rendering assets*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { getCharacterAsset } from "../../api/user-service/menu/characterAsset";
import { getNpcAsset } from "../../api/user-service/menu/npcAsset";
import { ErrorPopup } from "../../pages/ErrorPage";
import { createLeafShader } from "./shaders/leafShader";

export class renderAsset {

	private _scene: BABYLON.Scene;
	private _player?: BABYLON.Mesh;
	private _npc ?:BABYLON.Mesh;
	private _chest?: BABYLON.Mesh;
	private _sandcastle ?: BABYLON.Mesh;
	private _bob?: BABYLON.Mesh;

	private _pirateBoat?: BABYLON.Mesh;
	private _bendTrees?: BABYLON.TransformNode[] = [];
	private _straighTrees?: BABYLON.TransformNode[] = [];

	private _leafShader?: BABYLON.ShaderMaterial;


	
	
	private _loadedMap?: Record<string, BABYLON.AbstractMesh>;
	private _titleType: Record<number, string> = {
			0: "nothing",
			1: "/asset/environements/Models/GLBformat/patch-sand-foliage.glb",
			2: "/asset/environements/Models/GLBformat/patch-sand.glb",
			3: "/asset/environements/Models/GLBformat/patch-grass.glb",
			4: "/asset/environements/Models/GLBformat/patch-grass-foliage.glb",
			6: "/asset/environements/Models/GLBformat/rocks-a.glb",
			7: "/asset/environements/Models/GLBformat/rocks-b.glb",
			8: "/asset/environements/Models/GLBformat/rocks-sand-a.glb",
			9: "/asset/environements/Models/GLBformat/rocks-sand-b.glb"
		}
	
	constructor (scene: BABYLON.Scene) {
		this._scene = scene;
		// this._leafShader = createLeafShader(this._scene);
		// this._leafShader.backFaceCulling = false;
	}

	public async _load(): Promise<void> {
		await this._loadGround();
		await this._loadPlayer();
		await this._loadNpc();
		await this._loadBob();
		await this._loadSanCastle();
		await this._loadChest();
		await this._loadMap();
		await this.__loadStageSet();
	}

	private async _loadGround(){
		const ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100, subdivisions: 4}, this._scene);
		ground.position = new BABYLON.Vector3(0, -0.5 , 0);
		ground.checkCollisions = true;

		const groundMaterial = new BABYLON.StandardMaterial("ground-material", this._scene);
		groundMaterial.alpha = 0;
		groundMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

		ground.material = groundMaterial;

		const Wall_S: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("wall", {width: 100, height: 5, depth:0.2}, this._scene);
		Wall_S.position.set(10, 0, -30);
		Wall_S.isVisible = false;
		Wall_S.checkCollisions = true;

		const Wall_W: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("wall", {width: 70, height: 5, depth:0.2}, this._scene);
		Wall_W.position.set(-30, 0, 0);
		Wall_W.isVisible = false;
		Wall_W.rotation.set(0, -1.5, 0);
		Wall_W.checkCollisions = true;

		const Wall_E: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("wall", {width: 70, height: 5, depth:0.2}, this._scene);
		Wall_E.position.set(42, 0, 0);
		Wall_E.isVisible = false;
		Wall_E.rotation.set(0, -1.7, 0);
		Wall_E.checkCollisions = true;
	}

	private async _loadPlayer() {
		/******************************load player******************************/
		let AssetNumber: number = 0;
		try {
			const req = await getCharacterAsset();
			if (req.ok) {
				AssetNumber  = req.asset!;
				console.log("AssetData = ", req.asset as number);
			}
		} catch(error) {
			await ErrorPopup(error as string);
		}
		const result = await ImportMeshAsync(`/asset/Characters/Models/GLBformat/character-${AssetNumber}.glb`, this._scene);
		if (result)
			console.log("Meshes Player import succesfully", result.meshes);
		this._setUpMesh(result, new BABYLON.Vector3(5, 0, 5), 1.5);
		this._player = result.meshes[0] as BABYLON.Mesh;
		if (!this._player)
			console.log("player not initialized:");
		this._addColisionPlayer(this._player);
	}

	private async _loadNpc() {
		/******************************load npc******************************/
		let AssetNumber: number = 0;
		try {
			const req = await getNpcAsset();
			if (req.ok) {
				AssetNumber = req.asset!;
				// console.log("AssetNumber NPC = " , AssetNumber);
			}
		} catch (error) {
			await ErrorPopup(error as string);
		}
		const result = await ImportMeshAsync(`/asset/Characters/Models/GLBformat1/character-${AssetNumber}.glb`, this._scene);
		if (result)
			console.log("mesh npc import successfully");
		this._catAnimationGroupName(result, "npc_");
		this._addColisionForEach(result);
		this._setUpMesh(result, BABYLON.Vector3.Zero(), 2);
		this._npc = result.meshes[0] as BABYLON.Mesh;
		this._npc.rotation = new BABYLON.Vector3(0, 1, 0);
		this._npc.position = new BABYLON.Vector3(35, 0, -10);
	}

	private async _loadBob() {
		/******************************load Bob Asset******************************/
		const result = await ImportMeshAsync("/assets/bob.glb", this._scene);
		this._addColisionForEach(result);
		this._bob = result.meshes[0] as BABYLON.Mesh;
		this._bob.position.set(-21, 0, 0);
		this._bob.rotation = new BABYLON.Vector3(0, -1, 0);
	}

	private async _loadSanCastle() {
		/**************************for sand castle**************************/
		const result = await ImportMeshAsync("/assets/chateauSable.glb", this._scene);
		result.animationGroups.forEach(element => {
			element.stop();
		});
		this._addColisionForEach(result);
		this._sandcastle = result.meshes[0] as BABYLON.Mesh;
		this._sandcastle.scaling.scaleInPlace(0.3);
		this._sandcastle.position = new BABYLON.Vector3(-25, 1, -25);
		this._sandcastle.rotation = new BABYLON.Vector3(0, 0, 0);	
	}

	private async _loadChest() {
		/**************************for chest**************************/
		const result = await ImportMeshAsync("/asset/environements/Models/GLBformat/chest.glb", this._scene);
		this._catAnimationGroupName(result, "chest_");
		this._addColisionForEach(result);
		this._chest = result.meshes[0] as BABYLON.Mesh;
		this._chest.scaling.scaleInPlace(3);
		this._chest.position = new BABYLON.Vector3(36, 0, 13);
		this._chest.rotationQuaternion = null;
		this._chest.rotation = new BABYLON.Vector3(0, 1, 0);
	}

	private  async _loadMap() {
		/******************************load maps Asset******************************/
		this._loadedMap = {};
		for (const type in this._titleType) {
			if (this._titleType[type] != "nothing")
			{
				const result1 = await ImportMeshAsync(this._titleType[type], this._scene);
				if (result1)
					console.log("Meshes map import succesfully", result1.meshes);
				else
					console.log("cannot map ", this._titleType[type]);
				this._setUpMesh(result1, BABYLON.Vector3.Zero(), 3.5);
				const mesh = result1.meshes[0];
				mesh.setEnabled(false);
				this._loadedMap[type] = mesh;
			}
		}
	}

	private async __loadStageSet(): Promise<void> {
		await this._loadboats();
		await this._loadPlatforms()
		await this._loadBottleCrates();
		await this._loadStraightTrees();
		await this._loadBendTrees();
		await this._loadTower();
		await this._loadFlag();
		await this._loadBarrel();
	}

	private async _loadboats() {
		/**************************for boat 1**************************/
		const resBoat1 = await ImportMeshAsync("/asset/environements/Models/GLBformat/ship-pirate-large.glb", this._scene)
		this._addColisionForEach(resBoat1);
		this._pirateBoat = resBoat1.meshes[0] as BABYLON.Mesh;
		this._pirateBoat.getChildMeshes().forEach(child => {
			console.log('child boat : ', child.name);
		});
		this._pirateBoat.position = new BABYLON.Vector3(-30 , -1, -5);
		this._pirateBoat.rotation = BABYLON.Vector3.Zero();
		this._pirateBoat.scaling.scaleInPlace(2);

		/**************************for boat 2**************************/
		const resBoat2 = await ImportMeshAsync("/asset/environements/Models/GLBformat/ship-ghost.glb", this._scene)
		this._addColisionForEach(resBoat2);
		var boat2 = resBoat2.meshes[0];
		boat2.position = new BABYLON.Vector3(15 ,0, 20);
		boat2.rotation = new BABYLON.Vector3(0, -1, 0.1);

		/**************************for boat 3**************************/
		const resBoat3 = await ImportMeshAsync("/asset/environements/Models/GLBformat/boat-row-small.glb", this._scene)
		this._addColisionForEach(resBoat3);
		var boat3 = resBoat3.meshes[0];
		boat3.position = new BABYLON.Vector3(-25 ,0, 22);
		boat3.rotation = new BABYLON.Vector3(0, -1, 0.1);
		boat3.scaling.scaleInPlace(2);
	}

	private async _loadPlatforms() {
		/**************************for plateform**************************/
		const result = await  ImportMeshAsync("/asset/environements/Models/GLBformat/structure-platform.glb", this._scene).then(function (result) {
			var mesh: BABYLON.AbstractMesh = result.meshes[0];
			mesh.setEnabled(false);
			for (let index:number = 0; index < 25; index++) {
				var instance = mesh.instantiateHierarchy() as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3(-25, 0, index - 10);
				instance.setEnabled(true);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
				});
			}
		})
	}

	private async _loadBottleCrates() {
		/**************************for bottle crate**************************/
		const result = await  ImportMeshAsync("/asset/environements/Models/GLBformat/crate-bottles.glb", this._scene).then(function (result) {
			var mesh: BABYLON.AbstractMesh = result.meshes[0];
			mesh.setEnabled(false);
			for (let index:number = 0; index < 2; index++) {
				index + 5;
				var instance = mesh.instantiateHierarchy() as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3(-22, 0, (index - 2) * 5);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
				});
			}
		})
	}

	private async _loadStraightTrees() {
		/**************************for straight tree**************************/
		const result = await  ImportMeshAsync("/asset/environements/Models/GLBformat/palm-straight.glb", this._scene)
			var mesh: BABYLON.AbstractMesh = result.meshes[0];

			if (!this._leafShader)
				this._initLeafShader(mesh);

			for (let index:number = 0; index < 2; index++) {
				var instance = mesh.clone("", null) as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3(-23, 0,( index + 1) * 4);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
					if (this._leafShader)
						child.material = this._leafShader;});
				this._straighTrees?.push(instance);
			}
			for (let index:number = 0; index < 3; index++) {
				var instance = mesh.clone("", null) as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3((index - 3) * 2, 0, 25);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
					if (this._leafShader)
						child.material = this._leafShader;});
				this._straighTrees?.push(instance);
			}
			for (let index:number = 0; index < 2; index++) {
				var instance = mesh.clone("", null) as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3(25 * index, 0 , (index ) * 15);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
					if (this._leafShader)
						child.material = this._leafShader;});
				this._straighTrees?.push(instance);
			}
			mesh.setEnabled(false);
	}

	private async _loadBendTrees() {
		/**************************for bend tree**************************/
		const result = await ImportMeshAsync("/asset/environements/Models/GLBformat/palm-detailed-bend.glb", this._scene) 
			var mesh: BABYLON.AbstractMesh = result.meshes[0];

			for (let index:number = 0; index < 2; index++) {
				var instance = mesh.clone("", null) as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3((index)* 30, 0, (index - 5) * 4);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
					if (this._leafShader)
						child.material = this._leafShader;});
				if (this._bendTrees)
					this._bendTrees.push(instance);
			}
			for (let index:number = 0; index < 2; index++) {
				var instance = mesh.clone("", null) as BABYLON.TransformNode;
				instance.position = new BABYLON.Vector3((index - 2) * 3 , 0, 29);
				instance.setEnabled(true);
				instance.scaling.scaleInPlace(1.5);
				instance.getChildMeshes().forEach(child => {
					child.checkCollisions = true;
					if (this._leafShader)
						child.material = this._leafShader;
				});
				if (this._bendTrees)
					this._bendTrees.push(instance);
			}
			mesh.setEnabled(false);
	}

	private _initLeafShader(mesh: BABYLON.AbstractMesh) {
		mesh.getChildMeshes().forEach(child => {
				const originalMaterial = child.material as BABYLON.StandardMaterial | BABYLON.PBRMaterial;
			
				let leafTexture: BABYLON.Texture | undefined;
			
				if (originalMaterial instanceof BABYLON.StandardMaterial && originalMaterial.diffuseTexture) {
					if (originalMaterial.diffuseTexture instanceof BABYLON.Texture) {
						leafTexture = originalMaterial.diffuseTexture;
					}} 
				else if (originalMaterial instanceof BABYLON.PBRMaterial && originalMaterial.albedoTexture) {
					if (originalMaterial.albedoTexture instanceof BABYLON.Texture) {
						leafTexture = originalMaterial.albedoTexture;}}
				if (leafTexture) 
					this._leafShader = createLeafShader(this._scene, leafTexture);
		})
	}

	private async _loadTower() {
		/**************************for tower**************************/
		const result = await ImportMeshAsync("/asset/environements/Models/GLBformat/tower-complete-large.glb", this._scene);
		this._addColisionForEach(result);
		var tower = result.meshes[0];
		tower.position = new BABYLON.Vector3(4, 0, 29);
		tower.rotation = new BABYLON.Vector3(0, 0, 0);
		tower.scaling.scaleInPlace(2);
	}

	private async _loadFlag() {
		/**************************for flag**************************/
		const result = await ImportMeshAsync("/asset/environements/Models/GLBformat/flag-pirate-pennant.glb", this._scene);
		this._addColisionForEach(result);
		var flag = result.meshes[0];
		flag.position = new BABYLON.Vector3(36, 0, 16);
		flag.rotation =  BABYLON.Vector3.Zero();
		flag.scaling.scaleInPlace(3);
	}

	private async _loadBarrel() {
		/**************************for barrel**************************/
		const result = await ImportMeshAsync("/asset/environements/Models/GLBformat/barrel.glb", this._scene);
		this._addColisionForEach(result);
		var barrel = result.meshes[0];
		barrel.position = new BABYLON.Vector3(-25 ,0, 18);
		barrel.rotation = new BABYLON.Vector3(0, -1, 0.1);
		barrel.scaling.scaleInPlace(2);
	}

	private _setUpMesh(result: BABYLON.ISceneLoaderAsyncResult, position: BABYLON.Vector3, scaling: number) {
		result.meshes.forEach(result => {
			result.position = position;
			result.rotation = BABYLON.Vector3.Zero();
			result.scaling.scaleInPlace(scaling);
		});
	}

	private _catAnimationGroupName(result: BABYLON.ISceneLoaderAsyncResult, string: string) {
		result.animationGroups.forEach(child => {
			child.name = string + child.name;
		});
	}

	private	_addColisionPlayer(mesh: BABYLON.Mesh) {
		console.log("mesh name : ", mesh.name);
		mesh.checkCollisions = true; // activation collision for player
		mesh.ellipsoid = new BABYLON.Vector3(0.7, 1.5, 0.7); // define collision arround player
		mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0); // center collision not necessary
	}

	private _addColisionForEach(result: BABYLON.ISceneLoaderAsyncResult) {
		result.meshes.forEach(child => {
			child.checkCollisions = true;
		})
	}

	get	playermesh():BABYLON.Mesh {
		if (!this._player)
			throw new Error("player asset not initialized");
		return this._player;
	}

	get LoadedMap(): Record<string, BABYLON.AbstractMesh> {
		if (!this._loadedMap)
			throw new Error("loadedMap asset not initialized");
		return this._loadedMap;
	}

	get	sandcastle(): BABYLON.Mesh {
		if (!this._sandcastle)
			throw new Error("sandcastle asset not initialized");
		return this._sandcastle;
	}

	get chest(): BABYLON.Mesh {
		if (!this._chest)
			throw new Error("chest asset not initialized");
		return this._chest;
	}

	get npc(): BABYLON.Mesh {
		if (!this._npc)
			throw new Error("npc asset not initialized");
		return this._npc;
	}

	get bendTrees(): BABYLON.TransformNode[] {
		if (!this._bendTrees)
			throw new Error("bend trees asset not initialized");
		return this._bendTrees;
	}

	get straightTrees(): BABYLON.TransformNode[] {
		if (!this._straighTrees)
			throw new Error("bend trees asset not initialized");
		return this._straighTrees;
	}

	get leafShader(): BABYLON.ShaderMaterial {
		if (!this._leafShader)
			throw new Error("no Leaf Shader found");
		return this._leafShader;
	}

	get pirateBoat(): BABYLON.Mesh {
		if (!this._pirateBoat)
			throw new Error("pirate boat asset not initialized");
		return this._pirateBoat;
	}
}