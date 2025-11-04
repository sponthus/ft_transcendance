/*****************************************************************export class for rendering assets*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { getCharacterAsset } from "../../api/user-service/menu/characterAsset";
import { getNpcAsset } from "../../api/user-service/menu/npcAsset";
import { ErrorPopup } from "../../pages/ErrorPage";
import { createLeafShader } from "./shaders/leafShader";
import { BabylonAssetCache } from "../Cache/LoadAssetWithCache";

export class renderAsset {

	private _scene: BABYLON.Scene;
	private _player?: BABYLON.Mesh;
	private _npc ?:BABYLON.Mesh;
	private _chest?: BABYLON.Mesh;
	private _sandcastle ?: BABYLON.Mesh;
	private _bob?: BABYLON.Mesh;

	private _pirateBoat?: BABYLON.Mesh;
	private _bendTrees?: BABYLON.TransformNode[] | null = [];
	private _straighTrees?: BABYLON.TransformNode[] = [];

	private _leafShader?: BABYLON.ShaderMaterial | null;
	
	
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
	}

	public async _load(): Promise<void> {
		if (this._scene && !this._scene.isDisposed) {
			await this._loadGround();
			await this._loadPlayer();
			await this._loadNpc();
			await this._loadBob();
			await this._loadSanCastle();
			await this._loadChest();
			await this._loadMap();
			await this.__loadStageSet();
			// BabylonAssetCache.printCacheStats();
		}
	}

	private _ground?: BABYLON.Mesh;
	private _Wall_S?: BABYLON.Mesh;
	private _Wall_W?: BABYLON.Mesh;
	private _Wall_E?: BABYLON.Mesh;

	private async _loadGround(){
		if (this._scene && !this._scene.isDisposed) {
			this._ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100, subdivisions: 4}, this._scene);
			this._ground.position = new BABYLON.Vector3(0, -0.5 , 0);
			this._ground.checkCollisions = true;

			const groundMaterial = new BABYLON.StandardMaterial("ground-material", this._scene);
			groundMaterial.alpha = 0;
			groundMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
			this._ground.material = groundMaterial;
		}

		if (this._scene && !this._scene.isDisposed) {
			this._Wall_S = BABYLON.MeshBuilder.CreateBox("wall", {width: 100, height: 5, depth:0.2}, this._scene);
			this._Wall_S.position.set(10, 0, -30);
			this._Wall_S.isVisible = false;
			this._Wall_S.checkCollisions = true;
		}

		if (this._scene && !this._scene.isDisposed) {
			this._Wall_W = BABYLON.MeshBuilder.CreateBox("wall", {width: 70, height: 5, depth:0.2}, this._scene);
			this._Wall_W.position.set(-30, 0, 0);
			this._Wall_W.isVisible = false;
			this._Wall_W.rotation.set(0, -1.5, 0);
			this._Wall_W.checkCollisions = true;
		}

		if (this._scene && !this._scene.isDisposed) {
			this._Wall_E = BABYLON.MeshBuilder.CreateBox("wall", {width: 70, height: 5, depth:0.2}, this._scene);
			this._Wall_E.position.set(42, 0, 0);
			this._Wall_E.isVisible = false;
			this._Wall_E.rotation.set(0, -1.7, 0);
			this._Wall_E.checkCollisions = true;
		}
		if (this._scene && !this._scene.isDisposed) {
			const Wall = BABYLON.MeshBuilder.CreateBox("wall", {width: 25, height: 5, depth:0.2}, this._scene);
			Wall.position.set(28, 0, 17.5);
			Wall.rotation.set(0, 0, 0);
			Wall.isVisible = false;
			Wall.checkCollisions = true;
		}
		if (this._scene && !this._scene.isDisposed) {
			const Wall = BABYLON.MeshBuilder.CreateBox("wall", {width: 40, height: 5, depth:0.2}, this._scene);
			Wall.position.set(-7, 0, 23);
			Wall.rotation.set(0, 0, 0);
			Wall.isVisible = false;
			Wall.checkCollisions = true;
		}
	}

	private async _loadPlayer() {
		/******************************load player******************************/
		let AssetNumber: number = 0;
		try {
			const req = await getCharacterAsset();
			if (req.ok) {
				AssetNumber  = req.asset!;
			}
			else
				throw new Error(req.error);
		} catch(error) {
			await ErrorPopup(error as string);
		}
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadWithCache(`/asset/Characters/Models/GLBformat/character-${AssetNumber}.glb`, this._scene);
			if (result) {
				this._setUpMesh(result, new BABYLON.Vector3(5, 0, 5), 1.5);
				this._player = result.meshes[0] as BABYLON.Mesh;
				if (!this._player)
					return ;
				this._addColisionPlayer(this._player);
				this._player.rotation = new BABYLON.Vector3(0, -3, 0);
			}
		}
	}

	private async _loadNpc() {
		/******************************load npc******************************/
		let AssetNumber: number = 0;
		try {
			const req = await getNpcAsset();
			if (req.ok) {
				AssetNumber = req.asset!;
			}
			else
				throw new Error(req.error);
		} catch (error) {
			await ErrorPopup(error as string);
		}
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadWithCache(`/asset/Characters/Models/GLBformat1/character-${AssetNumber}.glb`, this._scene);
			if (result) {
				this._catAnimationGroupName(result, "npc_");
				this._addColisionForEach(result);
				this._setUpMesh(result, BABYLON.Vector3.Zero(), 2);
				this._npc = result.meshes[0] as BABYLON.Mesh;
				this._npc.rotation = new BABYLON.Vector3(0, -2.5, 0);
				this._npc.position = new BABYLON.Vector3(35, 0, -10);
			}
		}
	}

	private async _loadBob() {
		/******************************load Bob Asset******************************/
		if (this._scene && !this._scene.isDisposed) {
			BabylonAssetCache._setEnable("/assets/bob.glb");
			const result = await BabylonAssetCache._loadWithCache("/assets/bob.glb", this._scene);
			result.animationGroups.forEach((element: BABYLON.AnimationGroup) => {
				element.enableBlending = true;
				element.blendingSpeed = 0.05;
				element.start();
			});
			this._addColisionForEach(result);
			this._bob = result.meshes[0] as BABYLON.Mesh;
			this._bob.position.set(-21, 0, 0);
			this._bob.rotation = new BABYLON.Vector3(0, -1, 0);
		}
	}

	private async _loadSanCastle() {
		/**************************for sand castle**************************/
		if (this._scene && !this._scene.isDisposed) {
			BabylonAssetCache._setEnable("/asset/SandCastle.glb");
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/SandCastle.glb", "_clone", this._scene);
			result.animationGroups.forEach((element: BABYLON.AnimationGroup) => {
				element.stop();
			});
			this._addColisionForEach(result);
			this._sandcastle = result.meshes[0] as BABYLON.Mesh;
			this._sandcastle.scaling.scaleInPlace(0.3);
			this._sandcastle.position = new BABYLON.Vector3(-25, 1, -25);
			this._sandcastle.rotation = new BABYLON.Vector3(0, 0, 0);	
		}
	}

	private async _loadChest() {
		/**************************for chest**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/chest.glb", "_chest_clone", this._scene);
			this._addColisionForEach(result);
			this._chest = result.meshes[0] as BABYLON.Mesh;
			this._chest.scaling.scaleInPlace(3);
			this._chest.position = new BABYLON.Vector3(36, 0, 13);
			this._chest.rotationQuaternion = null;
			this._chest.rotation = new BABYLON.Vector3(0, 1, 0);
		}
	}

	private  async _loadMap() {
		/******************************load maps Asset******************************/
		this._loadedMap = {};
		for (const type in this._titleType) {
			if (this._titleType[type] != "nothing")
				{
					if (this._scene && !this._scene.isDisposed) {
						const result1 = await BabylonAssetCache._loadAndCloneWithCache(this._titleType[type], "_clone", this._scene);
						this._addColisionForEach(result1);
						if (result1) {
							this._setUpMesh(result1, BABYLON.Vector3.Zero(), 3.5);
							const mesh = result1.meshes[0];
							mesh.setEnabled(false);
							this._loadedMap[type] = mesh;
						}
					}
				}
			}
		}

	private async __loadStageSet(): Promise<void> {
		if (this._scene && !this._scene.isDisposed) {
			await this._loadboats();
			await this._loadPlatforms()
			await this._loadBottleCrates();
			await this._loadStraightTrees();
			await this._loadBendTrees();
			await this._loadTower();
			await this._loadFlag();
			await this._loadBarrel();
			await this._loadPanel();
		}
	}

	private _boat2?: BABYLON.AbstractMesh;
	private _boat3?: BABYLON.AbstractMesh;

	private async _loadboats() {
		/**************************for boat 1**************************/
		if (this._scene && !this._scene.isDisposed) {
			const resBoat1 = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/ship-pirate-large.glb", "_clone", this._scene)
			this._addColisionForEach(resBoat1);
			this._pirateBoat = resBoat1.meshes[0] as BABYLON.Mesh;;
			this._pirateBoat.position = new BABYLON.Vector3(-30 , -1, -5);
			this._pirateBoat.rotation = BABYLON.Vector3.Zero();
			this._pirateBoat.scaling.scaleInPlace(2);
		}

		/**************************for boat 2**************************/
		if (this._scene && !this._scene.isDisposed) {
			const resBoat2 = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/ship-ghost.glb", "_clone", this._scene)
			this._addColisionForEach(resBoat2);
			this._boat2 = resBoat2.meshes[0];
			this._boat2.position = new BABYLON.Vector3(15 ,0, 20);
			this._boat2.rotation = new BABYLON.Vector3(0, -1, 0.1);
		}

		/**************************for boat 3**************************/
		if (this._scene && !this._scene.isDisposed) {
			const resBoat3 = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/boat-row-small.glb", "_clone", this._scene)
			this._addColisionForEach(resBoat3);
			this._boat3 = resBoat3.meshes[0];
			this._boat3.position = new BABYLON.Vector3(-25 ,0, 22);
			this._boat3.rotation = new BABYLON.Vector3(0, -1, 0.1);
			this._boat3.scaling.scaleInPlace(2);
		}
	}

	private _platform?: BABYLON.TransformNode[] = [];

	private async _loadPlatforms() {
		/**************************for plateform**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await  BabylonAssetCache._loadAndCloneWithCache(`/asset/environements/Models/GLBformat/structure-platform.glb`, "_clone", this._scene)
				var mesh: BABYLON.AbstractMesh = result.meshes[0];
				mesh.setEnabled(false);
				for (let index:number = 0; index < 25; index++) {
					var instance = mesh.instantiateHierarchy() as BABYLON.TransformNode;
					instance.position = new BABYLON.Vector3(-25, 0, index - 10);
					instance.setEnabled(true);
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {child.checkCollisions = true;});
					if (this._platform)
						this._platform.push(instance);
				}
		}
	}

	private _bottles?: BABYLON.TransformNode[] = [];

	private async _loadBottleCrates() {
		/**************************for bottle crate**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await  BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/crate-bottles.glb", "_clone", this._scene)
				var mesh: BABYLON.AbstractMesh = result.meshes[0];
				mesh.setEnabled(false);
				for (let index:number = 0; index < 2; index++) {
					index + 5;
					var instance = mesh.instantiateHierarchy() as BABYLON.TransformNode;
					instance.position = new BABYLON.Vector3(-22, 0, (index - 2) * 5);
					instance.setEnabled(true);
					instance.scaling.scaleInPlace(1.5);
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {child.checkCollisions = true;});
					if (this._bottles)
						this._bottles.push(instance);
				}
		}
	}

	private async _loadStraightTrees() {
		/**************************for straight tree**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await  BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/palm-straight.glb", "_clone", this._scene)
				var mesh: BABYLON.AbstractMesh = result.meshes[0];
	
				if (this._leafShader === undefined)
					this._initLeafShader(mesh);
	
				for (let index:number = 0; index < 2; index++) {
					var instance = mesh.clone("", null) as BABYLON.TransformNode;
					instance.position = new BABYLON.Vector3(-23, 0,( index + 1) * 4);
					instance.setEnabled(true);
					instance.scaling.scaleInPlace(1.5);
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
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
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
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
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
						child.checkCollisions = true;
						if (this._leafShader)
							child.material = this._leafShader;});
					this._straighTrees?.push(instance);
				}
				mesh.setEnabled(false);
				mesh.dispose();
		}
	}

	private async _loadBendTrees() {
		/**************************for bend tree**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/palm-detailed-bend.glb", "_clone", this._scene) 
				var mesh: BABYLON.AbstractMesh = result.meshes[0];
	
				for (let index:number = 0; index < 2; index++) {
					var instance = mesh.clone("", null) as BABYLON.TransformNode;
					instance.position = new BABYLON.Vector3((index)* 30, 0, (index - 5) * 4);
					instance.setEnabled(true);
					instance.scaling.scaleInPlace(1.5);
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
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
					instance.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
						child.checkCollisions = true;
						if (this._leafShader)
							child.material = this._leafShader;
					});
					if (this._bendTrees)
						this._bendTrees.push(instance);
				}
				mesh.setEnabled(false);
				mesh.dispose();
		}
	}

	private _initLeafShader(mesh: BABYLON.AbstractMesh) {
		mesh.getChildMeshes().forEach((child: BABYLON.AbstractMesh) => {
				const originalMaterial = child.material as BABYLON.StandardMaterial | BABYLON.PBRMaterial;
			
				let leafTexture: BABYLON.Texture | undefined;
			
				if (originalMaterial instanceof BABYLON.StandardMaterial && originalMaterial.diffuseTexture) {
					if (originalMaterial.diffuseTexture instanceof BABYLON.Texture) {
						leafTexture = originalMaterial.diffuseTexture;
					}} 
				else if (originalMaterial instanceof BABYLON.PBRMaterial && originalMaterial.albedoTexture) {
					if (originalMaterial.albedoTexture instanceof BABYLON.Texture) {
						leafTexture = originalMaterial.albedoTexture;}}
				if (leafTexture && this._leafShader === undefined)
					this._leafShader = createLeafShader(this._scene, leafTexture);
				if (this._leafShader !== undefined)
					child.material = this._leafShader!;
		})
	}

	private _tower?: BABYLON.AbstractMesh;

	private async _loadTower() {
		/**************************for tower**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/tower-complete-large.glb", "_clone", this._scene);
			this._addColisionForEach(result);
			this._tower = result.meshes[0];
			this._tower.position = new BABYLON.Vector3(4, 0, 29);
			this._tower.rotation = new BABYLON.Vector3(0, 0, 0);
			this._tower.scaling.scaleInPlace(2);
		}
	}

	private _flag?: BABYLON.AbstractMesh;

	private async _loadFlag() {
		/**************************for flag**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/flag-pirate-pennant.glb", "_clone", this._scene);
			this._addColisionForEach(result);
			this._flag = result.meshes[0];
			this._flag.position = new BABYLON.Vector3(36, 0, 16);
			this._flag.rotation =  BABYLON.Vector3.Zero();
			this._flag.scaling.scaleInPlace(3);
		}
	}

	private _barrel?: BABYLON.AbstractMesh;

	private async _loadBarrel() {
		/**************************for barrel**************************/
		if (this._scene && !this._scene.isDisposed) {
			const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/environements/Models/GLBformat/barrel.glb", "_clone", this._scene);
			this._addColisionForEach(result);
			this._barrel = result.meshes[0];
			this._barrel.position = new BABYLON.Vector3(-25 ,0, 18);
			this._barrel.rotation = new BABYLON.Vector3(0, -1, 0.1);
			this._barrel.scaling.scaleInPlace(2);
		}
	}

	private _Panel?: BABYLON.AbstractMesh;

	private async _loadPanel() {
		/**************************for Panel**************************/
		BabylonAssetCache._setEnable("/asset/MovePanel.glb");
		const result = await BabylonAssetCache._loadAndCloneWithCache("/asset/MovePanel.glb", "_clone", this._scene);
		this._Panel = result.meshes[0];
		this._Panel.position = new BABYLON.Vector3(-19 ,0, 22);
		this._Panel.rotation = new BABYLON.Vector3(0, 1.5, 0);
		this._Panel.scaling.scaleInPlace(5);
	}


	private _setUpMesh(result: BABYLON.ISceneLoaderAsyncResult, position: BABYLON.Vector3, scaling: number) {
		result.meshes.forEach((mesh: BABYLON.AbstractMesh) => {
			mesh.scaling.setAll(1);
        	mesh.rotation.setAll(0);

			mesh.position.copyFrom(position);
			mesh.rotation = BABYLON.Vector3.Zero();
			mesh.scaling.scaleInPlace(scaling);
		});
	}

	private _catAnimationGroupName(result: BABYLON.ISceneLoaderAsyncResult, string: string) {
		result.animationGroups.forEach((child: BABYLON.AnimationGroup) => {
			if (!child.name.includes(string))
				child.name = string + child.name;
		});
	}

	private	_addColisionPlayer(mesh: BABYLON.Mesh) {
		mesh.checkCollisions = true; // activation collision for player
		mesh.ellipsoid = new BABYLON.Vector3(0.7, 1.5, 0.7); // define collision arround player
		mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0); // center collision not necessary
	}

	private _addColisionForEach(result: BABYLON.ISceneLoaderAsyncResult) {
		result.meshes.forEach((child: BABYLON.AbstractMesh) => {
			child.checkCollisions = true;
		})
	}

	private printData(result: BABYLON.ISceneLoaderAsyncResult) {
		console.log("----------------------------------------------------");
		console.log("-----------------------------------------------------");
		console.log(`    Meshes: ${result.meshes.length}`);
		console.log(`    Animations: ${result.animationGroups.length}`);
		console.log(`    Animations name:`);
		result.animationGroups.forEach(ag => {console.log("-" + ag.name)});
		console.log(`    Skeletons: ${result.skeletons.length}`);
		console.log("----------------------------------------------------");
		console.log("----------------------------------------------------");
	}

	get	playermesh():BABYLON.Mesh {
		if (!this._player)
			throw new Error("Player asset not initialized");
		return this._player;
	}

	get LoadedMap(): Record<string, BABYLON.AbstractMesh> {
		if (!this._loadedMap)
			throw new Error("LoadedMap asset not initialized");
		return this._loadedMap;
	}

	get	sandcastle(): BABYLON.Mesh {
		if (!this._sandcastle)
			throw new Error("Sandcastle asset not initialized");
		return this._sandcastle;
	}

	get chest(): BABYLON.Mesh {
		if (!this._chest)
			throw new Error("Chest asset not initialized");
		return this._chest;
	}

	get npc(): BABYLON.Mesh {
		if (!this._npc)
			throw new Error("Npc asset not initialized");
		return this._npc;
	}

	get bendTrees(): BABYLON.TransformNode[] | null {
		if (!this._bendTrees) {
			return null;
			// throw new Error("Bend trees asset not initialized");
		}
		return this._bendTrees;
	}

	get straightTrees(): BABYLON.TransformNode[] {
		if (!this._straighTrees)
			throw new Error("Bend trees asset not initialized");
		return this._straighTrees;
	}

	get leafShader(): BABYLON.ShaderMaterial | null {
		if (!this._leafShader)
			return null;
			// throw new Error("No Leaf Shader found");
		return this._leafShader;
	}

	get pirateBoat(): BABYLON.Mesh {
		if (!this._pirateBoat)
			throw new Error("Pirate boat asset not initialized");
		return this._pirateBoat;
	}

	get Bob(): BABYLON.Mesh {
		if (!this._bob)
			throw new Error("Bob asset not initialized");
		return this._bob;
	}

	destroy(): void {
		if (this._ground) {
			this._ground.dispose();
			this._ground = undefined;
		}
		if (this._Wall_S) {
			this._Wall_S.dispose();
			this._Wall_S = undefined;
		}
		if (this._Wall_W) {
			this._Wall_W.dispose();
			this._Wall_W = undefined;
		}
		if (this._Wall_E) {
			this._Wall_E.dispose();
			this._Wall_E = undefined;
		}
		if (this._chest) {
			this._chest.dispose();
			this._chest = undefined;
		}
		if (this._sandcastle) {
			this._sandcastle.dispose();
			this._sandcastle = undefined;
		}
		// if (this._bob) {
		//     this._bob.dispose();
		//     this._bob = undefined;
		// }
		if (this._pirateBoat) {
		    this._pirateBoat.dispose();
		    this._pirateBoat = undefined;
		}
		if (this._leafShader) {
			this._leafShader.dispose();
			this._leafShader = undefined;
		}
		if (this._bendTrees) {
			this._bendTrees.forEach((tree: BABYLON.TransformNode) => {tree.dispose();});
			this._bendTrees = undefined;
		}
		if (this._straighTrees) {
			this._straighTrees.forEach((tree: BABYLON.TransformNode) => {tree.dispose();});
			this._straighTrees = undefined;		
		}
		if (this._boat2) {
			this._boat2.dispose();
			this._boat2 = undefined;
		}
		if (this._boat3) {
			this._boat3.dispose();
			this._boat3 = undefined;
		}
		if (this._tower) {
			this._tower.dispose();
			this._tower = undefined;
		}
		if (this._flag) {
			this._flag.dispose();
			this._flag = undefined;
		}
		if (this._barrel) {
			this._barrel.dispose();
			this._barrel = undefined;
		}
		if (this._Panel) {
			this._Panel.dispose();
			this._Panel = undefined;
		}
		if (this._loadedMap) {
			Object.values(this._loadedMap).forEach((mesh: BABYLON.AbstractMesh) => {
			    mesh.dispose();
			});
			this._loadedMap = undefined;	
		}
		if (this._platform) {
			this._platform.forEach((tree: BABYLON.TransformNode) => {tree.dispose();});
			this._platform = undefined;		
		}
		if (this._bottles) {
			this._bottles.forEach((tree: BABYLON.TransformNode) => {tree.dispose();});
			this._bottles = undefined;		
		}
	}
}