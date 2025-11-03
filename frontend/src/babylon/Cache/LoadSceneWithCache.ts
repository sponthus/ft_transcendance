import * as BABYLON from "@babylonjs/core";
import { BabylonAssetCache } from "./LoadAssetWithCache";

export class BabylonSceneCache {
	private static _SceneCache: Map<string, BABYLON.Scene> = new Map();

	public static _LoadSceneWithCache(Name: string, engine: BABYLON.Engine): BABYLON.Scene {
		if (this._SceneCache.has(Name))
			return this._SceneCache.get(Name)!;
		const scene: BABYLON.Scene = new BABYLON.Scene(engine);
		if (!scene)
			throw new Error("Scene failed to Load");
		scene.autoClear = true;
		scene.autoClearDepthAndStencil = true;
		scene.blockMaterialDirtyMechanism = true;
		this._SceneCache.set(Name, scene);
		return scene;
	}

	private static _clearElements(scene: BABYLON.Scene) {
			scene.meshes.slice().forEach(mesh => {
			    if (!BabylonAssetCache._cachedMeshes.has(mesh)) {
			        mesh.dispose();
			    }
			});
			scene.animationGroups.slice().forEach(animationGroup => {
				if (!BabylonAssetCache._cachedAnimationGroups.has(animationGroup)) {
					animationGroup.dispose();
				}
			});
			scene.skeletons.slice().forEach(skeleton => {
				if (!BabylonAssetCache._cachedSkeletons.has(skeleton)) {
					skeleton.dispose();
				}
			});
			scene.materials.slice().forEach(material => {
				if (!BabylonAssetCache._cachedMaterials.has(material)) {
					material.dispose();
				}
			});
			scene.particleSystems.slice().forEach(ps => {
				if (!BabylonAssetCache._cachedParticleSystems.has(ps)) {
					ps.dispose();
				}
			});
			scene.transformNodes.slice().forEach(node => {
				if (!BabylonAssetCache._cachedTransformNodes.has(node)) {
					node.dispose();
				}
			});
			scene.onBeforeRenderObservable.clear();
			scene.onAfterRenderObservable.clear();
	}

	public static _clearCacheScene() {
		this._SceneCache.forEach((scene, name) => {this._clearElements(scene);
		});
	}

	public static clearCache() {
		this._clearCacheScene();
		this._SceneCache.forEach((scene, name) => {scene.dispose();
		})
		this._SceneCache.clear();
	}

    public static printCacheStats(): void {
			console.log(`📊 Cache Statistics:`);
			console.log(`  Entries: ${this._SceneCache.size}`);
		
			this._SceneCache.forEach((result, path) => {
			    console.log(`  ${path}:`);
			    console.log(`    Meshes: ${result.meshes.length}`);
			    console.log(`    cameras: ${result.cameras.length}`);
				console.log(`    lights: ${result.lights.length}`);
				console.log(`    animationGroups: ${result.animationGroups.length}`);
				console.log(`    materials: ${result.materials.length}`);
				console.log(`    skeletons: ${result.skeletons.length}`);
				console.log(`    particleSystems: ${result.particleSystems.length}`);
				console.log(`    transformNodes: ${result.transformNodes.length}`);
			});
    }

}