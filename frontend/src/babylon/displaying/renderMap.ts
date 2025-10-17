/*****************************************************************export class for render map*****************************************************************/
import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export class renderMap {

	private _loadedMap?: Record<string, BABYLON.AbstractMesh>;
	private _scene?: BABYLON.Scene;


	private     _map: BABYLON.TransformNode;

	private _mapLayout: number[] = [
			0, 0, 0, 2, 1, 3, 1, 2, 0, 0, 0,
			0, 0, 1, 2, 2, 0, 0, 0, 0, 3, 2,
			1, 2, 3, 4, 1, 2, 1, 2, 2, 2, 3,
			3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 1,
			4, 4, 2, 2, 2, 1, 2, 2, 2, 2, 2,
			0, 0, 0, 2, 3, 2, 2, 3, 2, 3, 3,
			2, 1, 3, 2, 3, 3, 2, 2, 2, 1, 3,
			1, 2, 2, 2, 4, 2, 3, 2, 2, 2, 3,
			2, 1, 2, 1, 2, 1, 3, 2, 7, 9, 8,
			7, 0, 2, 2, 0, 3, 8, 0, 6, 7, 0,
			0, 9, 8, 3, 9, 3, 0, 0, 0, 0, 0  ];

	constructor(scene: BABYLON.Scene, loadedMap: Record<string, BABYLON.AbstractMesh> ) {
		this._loadedMap = loadedMap;
		this._scene = scene;

		this._map =  new BABYLON.TransformNode("map", this._scene);
		this._rederingMap();
	}

	private async _rederingMap(): Promise<void> {
		const titleSize: number = 2;
		
		const scalingFactor = 2.7;

		const gridWidth: number = Math.sqrt(this._mapLayout.length); // map has to be square
		const gridHeigt: number = gridWidth;
		for (let z:number = 0; z < gridWidth; z++) {
			for (let x: number = 0; x < gridHeigt; x++) {
				const index: number = z * gridWidth + x;
				if (this._mapLayout[index] != 0) {
					let titleid: number = this._mapLayout[index];
					const template = this._loadedMap![titleid.toString()] as BABYLON.AbstractMesh;
					if (!template)
						continue ;
					const instance = template.instantiateHierarchy() as  BABYLON.TransformNode;
					instance.parent = this._map;
					instance.position.set(x * titleSize , 0, z * titleSize );
					instance.setEnabled(true);
					instance.scaling.scaleInPlace(scalingFactor);
					instance.scaling.scaleInPlace(0.03);
					instance.getChildMeshes().forEach(child => {
						child.computeWorldMatrix(true);
						child.refreshBoundingInfo({});
						if (this._mapLayout[index] != 1 && this._mapLayout[index] != 2 && this._mapLayout[index] != 3 && this._mapLayout[index] != 4 )
							child.checkCollisions = true;
					});
				}
			}
		}
		this._map.scaling.scaleInPlace(scalingFactor);
		this._map.position = new BABYLON.Vector3(-20, -1, -20);
	}

	get map():  BABYLON.TransformNode {
		if (!this._map)
			throw new Error("map not initialized");
		return this._map;
	}
}

