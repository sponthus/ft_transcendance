import { Scene, AbstractMesh, AnimationGroup, Vector3 } from "@babylonjs/core";
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";

export class DisplayAssets {
	private _scene: Scene;
	private _crab1: AbstractMesh | null = null;
	private _crab2: AbstractMesh | null = null;
	private _caste: AbstractMesh | null = null;
	private _crab1Walk: AnimationGroup[] | null = null;

	private _patrick: AbstractMesh | null = null;
	private _bob: AbstractMesh | null = null;

	private _ananas: AbstractMesh | null = null;
	private _gary: AbstractMesh | null = null;

	constructor(scene: Scene) {
		this._scene = scene;
	}

	public async load(): Promise<void>
	{
		const result = await ImportMeshAsync("/assets/crabSamourail.glb", this._scene);
		this._crab1 = result.meshes[0];
		this._crab1.position.z = -8;
		this._crab1.scaling = new Vector3(0.18, 0.18, 0.18);
		this._crab1.rotation = new Vector3(0, 0, 0);
		result.animationGroups.forEach(anim => anim.stop());

		this._crab1Walk = result.animationGroups.filter(anim => anim.name.includes("walk")) || null;

		
		const result2 = await ImportMeshAsync("/assets/crabKing.glb", this._scene);
		this._crab2 = result2.meshes[0];
		this._crab2.position.z = 8;
		this._crab2.scaling = new Vector3(0.18, 0.18, 0.18);
		this._crab2.rotation = new Vector3(0, 3.14, 0);

		const result3 = await ImportMeshAsync("/assets/chateauSable.glb", this._scene);
		this._caste = result3.meshes[0];
		this._caste.position = new Vector3(0, -2, 0);

		// const result4 = await ImportMeshAsync("/assets/bobAnime.glb", this._scene);
		// this._bob = result4.meshes[0];
		// this._bob.scaling = new Vector3(2, 2, 2);
		// this._bob.position = new Vector3(3, 3, 3);
		// this._bobAnime = result.animationGroups.filter(anim => anim.name.includes("bob")) || null;


		const result4 = await ImportMeshAsync("/assets/patrick.glb", this._scene);
		this._patrick = result4.meshes[0];
		this._patrick.position.x = 5.8;
		this._patrick.position.y = -0.2;
		this._patrick.position.z = 3;
		this._patrick.scaling = new Vector3(1.1, 1.1, 1.1);
		this._patrick.rotation = new Vector3(0, 4.3, 0);

		const result5 = await ImportMeshAsync("/assets/bob.glb", this._scene);
		this._bob = result5.meshes[0];
		this._bob.position.x = 7;
		this._bob.position.y = -0.3;
		this._bob.position.z = 0;
		this._bob.scaling = new Vector3(0.4, 0.4, 0.4);
		this._bob.rotation = new Vector3(0, 4.7, 0);

		const result6 = await ImportMeshAsync("/assets/ananas.glb", this._scene);
		this._ananas = result6.meshes[0];
		this._ananas.position.x = 8;
		this._ananas.position.y = -1;
		this._ananas.position.z = 6.4;
		//this._ananas.scaling = new Vector3(1.2, 1.2, 1.2);
		//this._ananas.rotation = new Vector3(0, 4.7, 0);

		const result7 = await ImportMeshAsync("/assets/gary.glb", this._scene);
		this._gary = result7.meshes[0];
		this._gary.position.x = -6.2;
		this._gary.position.y = 0.1;
		this._gary.position.z = -6;
		this._gary.scaling = new Vector3(0.02, 0.02, 0.02);
		//this._ananas.rotation = new Vector3(0, 4.7, 0);


		this._caste.freezeWorldMatrix(); // plus de recalculs de position/rotation/scale
		this._caste.doNotSyncBoundingInfo = true; // plus de bounding box à recalculer
		this._caste.isPickable = false; // si t'as pas besoin de clic dessus
		this._caste.receiveShadows = false; // si pas de shadow nécessaire

		this.playWalk1();
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
	
}