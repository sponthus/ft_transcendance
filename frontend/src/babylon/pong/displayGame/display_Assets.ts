// Core
import { Scene, AbstractMesh, AnimationGroup, Vector3, Mesh, MeshBuilder, Vector2, Color3 } from "@babylonjs/core";

// Loaders pour glTF/GLB
import "@babylonjs/loaders/glTF";

// Textures et cube textures
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";

// Matériaux
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

// Water Material
import { WaterMaterial } from "@babylonjs/materials/water/waterMaterial";

// SceneLoader
import { SceneLoader, ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Quaternion } from "@babylonjs/core/Maths/math.vector";


export class DisplayAssets {
	private _scene: Scene;
	private _crab1: AbstractMesh | null = null;
	private _crab2: AbstractMesh | null = null;
	private _crabRobot1: AbstractMesh | null = null;
	private _crabRobot2: AbstractMesh | null = null;
	private _bullBob: AbstractMesh | null = null;
	private _bullPatrick: AbstractMesh | null = null;
	private _caste: AbstractMesh | null = null;
	private _casteAnimation: AnimationGroup[] | null = null;
	private _crab1Walk: AnimationGroup[] | null = null;

	private _patrick: AbstractMesh | null = null;
	private _bob: AbstractMesh | null = null;

	private _ananas: AbstractMesh | null = null;
	private _gary: AbstractMesh | null = null;

	private _menuPause: AbstractMesh | null = null;
	private _menuPauseSansCrab: AbstractMesh | null = null;

	//private _skybox: AbstractMesh | null = null;

	private _pancartePlayer1: AbstractMesh | null = null;
	private _pancartePlayer2: AbstractMesh | null = null;

	private _ground?: Mesh;
	private _waterMaterial?: WaterMaterial;
	private _skybox?: Mesh;
	private _skyboxMaterial?: StandardMaterial;

	constructor(scene: Scene) {
		this._scene = scene;
	}

	public async load(): Promise<void>
	{
		if (this._scene && !this._scene.isDisposed) {
			const result = await ImportMeshAsync("/assets/crabSamourail.glb", this._scene);
			this._crab1 = result.meshes[0];
			this._crab1.position.z = -8;
			this._crab1.scaling = new Vector3(0.18, 0.18, 0.18);
			this._crab1.rotation = new Vector3(0, 0, 0);
			result.animationGroups.forEach(anim => anim.stop());

			this._crab1Walk = result.animationGroups.filter(anim => anim.name.includes("walk")) || null;
		}


		if (this._scene && !this._scene.isDisposed) {
			const result2 = await ImportMeshAsync("/assets/crabKing.glb", this._scene);
			this._crab2 = result2.meshes[0];
			this._crab2.position.z = 8;
			this._crab2.scaling = new Vector3(0.18, 0.18, 0.18);
			this._crab2.rotation = new Vector3(0, 3.14, 0);
		}

		if (this._scene && !this._scene.isDisposed) {
			const result3 = await ImportMeshAsync("/assets/chateauSable.glb", this._scene);
			this._caste = result3.meshes[0];
			this._caste.position = new Vector3(0, -2, 0);
			result3.animationGroups.forEach(anim => anim.start(true, 1.0));
		}
		// const result4 = await ImportMeshAsync("/assets/bobAnime.glb", this._scene);
		// this._bob = result4.meshes[0];
		// this._bob.scaling = new Vector3(2, 2, 2);
		// this._bob.position = new Vector3(3, 3, 3);
		// this._bobAnime = result.animationGroups.filter(anim => anim.name.includes("bob")) || null;


		if (this._scene && !this._scene.isDisposed) {
			const result4 = await ImportMeshAsync("/assets/patrick.glb", this._scene);
			this._patrick = result4.meshes[0];
			this._patrick.position.x = 5.8;
			this._patrick.position.y = -0.2;
			this._patrick.position.z = 3;
			this._patrick.scaling = new Vector3(1.1, 1.1, 1.1);
			this._patrick.rotation = new Vector3(0, 4.3, 0);
		}

		if (this._scene && !this._scene.isDisposed) {
			const result5 = await ImportMeshAsync("/assets/bob.glb", this._scene);
			this._bob = result5.meshes[0];
			this._bob.position.x = 7.5;
			this._bob.position.y = -0.3;
			this._bob.position.z = -2;
			this._bob.scaling = new Vector3(0.4, 0.4, 0.4);
			this._bob.rotation = new Vector3(0, 4.7, 0);	
		}

		if (this._scene && !this._scene.isDisposed) {
			const result6 = await ImportMeshAsync("/assets/ananas.glb", this._scene);
			this._ananas = result6.meshes[0];
			this._ananas.position.x = 8;
			this._ananas.position.y = -1;
			this._ananas.position.z = 6.4;
			//this._ananas.scaling = new Vector3(1.2, 1.2, 1.2);
			//this._ananas.rotation = new Vector3(0, 4.7, 0);
		}

		if (this._scene && !this._scene.isDisposed) {
			const result7 = await ImportMeshAsync("/assets/gary.glb", this._scene);
			this._gary = result7.meshes[0];
			this._gary.position.x = -6.2;
			this._gary.position.y = 0.1;
			this._gary.position.z = -6;
			this._gary.scaling = new Vector3(0.02, 0.02, 0.02);
			//this._ananas.rotation = new Vector3(0, 4.7, 0);
		}

		if (this._scene && !this._scene.isDisposed){
			const result8 = await ImportMeshAsync("/assets/MenuPause.glb", this._scene);
			this._menuPause = result8.meshes[0];
			result8.animationGroups.forEach(anim => {
    			anim.start(true); // true = loop infini
				});
			// this._test.position.x = 8;
			// this._test.position.y = -2;
			// this._test.position.z = 8;
			//this._test.billboardMode = Mesh.BILLBOARDMODE_ALL;
			this._menuPause.scaling = new Vector3(0.035, 0.035, 0.035);
			// créer le parent et l'attacher à la caméra
			const hudParent = new TransformNode("hudParent", this._scene);
			hudParent.parent = this._scene.activeCamera!;        // le parent suit la caméra
			hudParent.position = new Vector3(0, 0, 2);           // 3 unités devant en espace local caméra
			// attacher ton mesh au parent
			this._menuPause.parent = hudParent;
			this._menuPause.billboardMode = Mesh.BILLBOARDMODE_ALL;   // si tu veux garder le billboard
			// appliquer l'offset 180°
			this._menuPause.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI);
			this._menuPause.setEnabled(false);
		}
		

		if (this._scene && !this._scene.isDisposed) {
			const result14 = await ImportMeshAsync("/assets/MenuPauseSansCrabmehameha.glb", this._scene);
			this._menuPauseSansCrab = result14.meshes[0];
			result14.animationGroups.forEach(anim => {
    			anim.start(true); // true = loop infini
				});
			// this._test.position.x = 8;
			// this._test.position.y = -2;
			// this._test.position.z = 8;
			//this._test.billboardMode = Mesh.BILLBOARDMODE_ALL;
			this._menuPauseSansCrab.scaling = new Vector3(0.035, 0.035, 0.035);
			// créer le parent et l'attacher à la caméra
			const hudParent2 = new TransformNode("hudParen2", this._scene);
			hudParent2.parent = this._scene.activeCamera!;        // le parent suit la caméra
			hudParent2.position = new Vector3(0, 0, 2);           // 3 unités devant en espace local caméra
			// attacher ton mesh au parent
			this._menuPauseSansCrab.parent = hudParent2;
			this._menuPauseSansCrab.billboardMode = Mesh.BILLBOARDMODE_ALL;   // si tu veux garder le billboard
			// appliquer l'offset 180°
			this._menuPauseSansCrab.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI);
			this._menuPauseSansCrab.setEnabled(false);
		}


		if (this._scene && !this._scene.isDisposed) {
			const result9 = await ImportMeshAsync("/assets/bullDiscussion2D.glb", this._scene);
			this._bullBob = result9.meshes[0];
			//this._bullBob.scaling = new Vector3(2, 2, 2);
			this._bullBob.position = new Vector3(8, 4.5, -2);
			this._bullBob.billboardMode = Mesh.BILLBOARDMODE_ALL;
			this._bullBob.setEnabled(false);
		}


		if (this._scene && !this._scene.isDisposed) {
			const result10 = await ImportMeshAsync("/assets/bullDiscussion2DPatrick.glb", this._scene);
			this._bullPatrick = result10.meshes[0];
			this._bullPatrick.position = new Vector3(7, 3.5, 3.5);
			this._bullPatrick.billboardMode = Mesh.BILLBOARDMODE_ALL;
			this._bullPatrick.setEnabled(false);
		}

		if (this._scene && !this._scene.isDisposed) {
			const result12 = await ImportMeshAsync("/assets/pancarte.glb", this._scene);
			this._pancartePlayer1 = result12.meshes[0];
			this._pancartePlayer1.position = new Vector3(7, 2, 10.5);
			this._pancartePlayer1.scaling = new Vector3(8,8,8);
			//this._pancartePlayer1.billboardMode = Mesh.BILLBOARDMODE_ALL;
		}

		if (this._scene && !this._scene.isDisposed) {
			const result13 = await ImportMeshAsync("/assets/pancarte.glb", this._scene);
			this._pancartePlayer2 = result13.meshes[0];
			this._pancartePlayer2.position = new Vector3(7, 1.8, -10.5);
			this._pancartePlayer2.scaling = new Vector3(8,8,8);"@babylonjs/core";
		}

		if (this._caste){
			this._caste.freezeWorldMatrix(); // plus de recalculs de position/rotation/scale
			this._caste.doNotSyncBoundingInfo = true; // plus de bounding box à recalculer
			this._caste.isPickable = false; // si t'as pas besoin de clic dessus
			this._caste.receiveShadows = false; // si pas de shadow nécessaire
		}

		this.playWalk1();

		if (this._scene && !this._scene.isDisposed)
			await this._makingSkybox();
		if (this._scene && !this._scene.isDisposed)
			await this._renderWater();
	}

	public playWalk1()
	{
		if (this._crab1Walk)
		{
    		this._crab1Walk.forEach(anim => {
      		// true = loop infini, 1.0 = vitesse normale
      		anim.start(true, 1.0);
    		});
  		}
	}

	public stopWalk1()
	{
		if (this._crab1Walk)
			this._crab1Walk.forEach(anim => anim.stop());
	}

	public get crab1(): AbstractMesh | null
	{
		return this._crab1;
	}

	public get crab2(): AbstractMesh | null
	{
		return this._crab2;
	}

	public get bullBob(): AbstractMesh | null
	{
		return this._bullBob;
	}

	public get bullPatrick(): AbstractMesh | null
	{
		return this._bullPatrick;
	}

	public get menuPause(): AbstractMesh | null
	{
		return this._menuPause;
	}

	public get menuPauseSansCrab(): AbstractMesh | null
	{
		return this._menuPauseSansCrab;
	}
	
	public get pancartePlayer1(): AbstractMesh | null
	{
		return this._pancartePlayer1;
	}

	public get pancartePlayer2(): AbstractMesh | null
	{
		return this._pancartePlayer2;
	}
	
	private async _makingSkybox(): Promise<void>
	{
		this._skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this._scene);

		this._skyboxMaterial = new StandardMaterial("skybox_material", this._scene);
		this._skyboxMaterial.backFaceCulling = false;
		this._skyboxMaterial.disableLighting = true;

		// Charge la texture d'environnement pré-filtrée
		// Assure-toi que le fichier env est dans /assets/skybox/env.env
		this._skyboxMaterial.reflectionTexture = CubeTexture.CreateFromPrefilteredData("/assets/textures/moon.env", this._scene);

		this._skybox.material = this._skyboxMaterial;
		this._skybox.infiniteDistance = true;
	}

	private async _renderWater(): Promise<void>
	{
		// Crée le plan d'eau
		this._ground = MeshBuilder.CreateGround("ground", {width: screen.width, height: screen.height, subdivisions: 64},this._scene);
		this._ground.position = new Vector3(5, -8, 5);

		// Crée le matériau eau
		this._waterMaterial = new WaterMaterial("water_material", this._scene, new Vector2(512, 512));

		this._waterMaterial.bumpTexture = new Texture("/asset/pic/26672.jpg", this._scene);
		this._waterMaterial.bumpHeight = 9;
		this._waterMaterial.bumpAffectsReflection = true;
		this._waterMaterial.bumpSuperimpose = true;

		this._waterMaterial.windForce = 1;
		this._waterMaterial.windDirection = new Vector2(-1, 0);

		this._waterMaterial.waveHeight = 0.5;
		this._waterMaterial.waveLength = 0.05;
		this._waterMaterial.waterColor = new Color3(0.1, 0.4, 1.4);
		this._waterMaterial.colorBlendFactor = 0.1;
		this._waterMaterial.alpha = 1.6;
		// Pour les reflets, on ajoute simplement les objets visibles à la liste de rendu
		if (this._skybox) this._waterMaterial.addToRenderList(this._skybox);

		// Assigne le matériau à ton plan d'eau
		this._ground.material = this._waterMaterial;
	}
}