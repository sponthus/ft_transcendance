import * as BABYLON from "@babylonjs/core";

let _suffix = "";

export class BabylonAssetCache {
	private static _meshCache: Map<string, BABYLON.ISceneLoaderAsyncResult> = new Map();
	// private static _meshCache: Map<string, BABYLON.ISceneLoaderAsyncResult> = new Map()

	public static _cachedMeshes: Set<BABYLON.AbstractMesh> = new Set();
	public static _cachedTransformNodes: Set<BABYLON.TransformNode> = new Set();
	public static _cachedAnimationGroups: Set<BABYLON.AnimationGroup> = new Set();
	public static _cachedSkeletons: Set<BABYLON.Skeleton> = new Set();
	public static _cachedLights: Set<BABYLON.Light> = new Set();
	public static _cachedParticleSystems: Set<BABYLON.IParticleSystem> = new Set();
	public static _cachedMaterials: Set<BABYLON.Material> = new Set();

	public static async _loadWithCache(Path: string ,Scene: BABYLON.Scene): Promise<BABYLON.ISceneLoaderAsyncResult> {
		if (this._meshCache.has(Path)) {
			this._meshCache.get(Path)!.meshes.forEach(m => {
				m.setEnabled(true);
				m.isVisible = true;
			});
			return this._meshCache.get(Path)!;
		}

		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", Path, Scene);
		this._storeOriginalReferences(result);
		this._meshCache.set(Path, result);
		return result;
	}

	private static _storeOriginalReferences(result: BABYLON.ISceneLoaderAsyncResult): void {
		result.meshes.forEach(mesh => {
			this._cachedMeshes.add(mesh)
			if (mesh.material)
				this._cachedMaterials.add(mesh.material);
		});
		result.transformNodes.forEach(node => this._cachedTransformNodes.add(node));
		result.animationGroups.forEach(ag => this._cachedAnimationGroups.add(ag));
		result.skeletons.forEach(skeleton => this._cachedSkeletons.add(skeleton));
		result.particleSystems.forEach(ps => this._cachedParticleSystems.add(ps));
		if (result.lights) {
			result.lights.forEach(light => this._cachedLights.add(light));
		}
	}

	public static async _loadAndCloneWithCache(Path: string, suffix: string ,Scene: BABYLON.Scene): Promise<BABYLON.ISceneLoaderAsyncResult> {
		_suffix = suffix;
		
		if (this._meshCache.has(Path)) {
			return this._cloneResult(this._meshCache.get(Path)!, Scene);
		}

		const container = await  BABYLON.SceneLoader.LoadAssetContainerAsync("",Path, Scene);
		container.animationGroups.forEach((Anime: BABYLON.AnimationGroup) => {Anime.stop();
		});
		const result: BABYLON.ISceneLoaderAsyncResult = {
			meshes: container.meshes,
			animationGroups: container.animationGroups,
			skeletons: container.skeletons,
			particleSystems: container.particleSystems,
			transformNodes: container.transformNodes,
			geometries: container.geometries,
			lights: container.lights,
			spriteManagers: (container as any).spriteManagers ?? []
		};
		this._meshCache.set(Path, result);

		return this._cloneResult(result, Scene);
	}

	public static _cloneResult(original : BABYLON.ISceneLoaderAsyncResult, scene: BABYLON.Scene): BABYLON.ISceneLoaderAsyncResult {

		original.meshes.forEach((mesh: BABYLON.AbstractMesh) => {
			mesh.setEnabled(false);
			mesh.isVisible = false;
		});
		original.transformNodes.forEach(Node => {
			Node.setEnabled(false);
			Node.isVisible = false;
		});

		const clonedMeshes = this._cloneMeshes(original.meshes, scene);
		const clonedSkeleton = this._cloneSkeketons(original.skeletons, original.meshes, clonedMeshes, scene);
		const clonedNodes = this._cloneTransformNode(original.transformNodes,original.meshes, clonedMeshes , scene);
		
		this._rebuildhierarchies(original.meshes, clonedMeshes, original.transformNodes, clonedNodes);
		const clonedAnimationGroups = this._cloneAnimationGroups(original.animationGroups, original.meshes, original.transformNodes , clonedMeshes,clonedNodes, clonedSkeleton, scene);
		return {
			meshes: clonedMeshes,
			animationGroups: clonedAnimationGroups,
			skeletons: clonedSkeleton,
			particleSystems: [],
			transformNodes:  clonedNodes,
			geometries: [],
			lights: [],
			spriteManagers: []
		};
	}

	private static _cloneMeshes(OriginalMeshes: BABYLON.AbstractMesh[], scene: BABYLON.Scene): BABYLON.AbstractMesh[] {

		const clonedMeshes: BABYLON.AbstractMesh[] = [];

		OriginalMeshes.forEach((OriginalMesh: BABYLON.AbstractMesh) => {
			const clonedMesh = OriginalMesh.clone(OriginalMesh.name + _suffix, null, false);
			if (!clonedMesh)
				return ;

			clonedMesh.setEnabled(true);
			clonedMesh.isVisible = true;
			clonedMesh.alwaysSelectAsActiveMesh = true;

			if (OriginalMesh.morphTargetManager) {
				clonedMesh.morphTargetManager = OriginalMesh.morphTargetManager.clone();
			}

			if (clonedMesh.material && !clonedMesh.material.name.includes("_shared"))
				clonedMesh.material = this._cloneMaterial(clonedMesh.material!, scene);

			clonedMeshes.push(clonedMesh);
		});

		return clonedMeshes;
	}

	private static _cloneMaterial(originalMAterial: BABYLON.Material, scene: BABYLON.Scene): BABYLON.Material {

		const clonedMAterial = originalMAterial!.clone(originalMAterial!.name + _suffix);

		if (!clonedMAterial) return originalMAterial;

		if (clonedMAterial instanceof BABYLON.StandardMaterial) {
			if (clonedMAterial.diffuseTexture)
				clonedMAterial.diffuseTexture = clonedMAterial.diffuseTexture.clone();
			if (clonedMAterial.specularTexture)
				clonedMAterial.specularTexture = clonedMAterial.specularTexture.clone();
			if (clonedMAterial.emissiveTexture)
				clonedMAterial.emissiveTexture = clonedMAterial.emissiveTexture.clone();
			if (clonedMAterial.bumpTexture)
				clonedMAterial.bumpTexture = clonedMAterial.bumpTexture.clone();
		}

		if (clonedMAterial instanceof BABYLON.PBRMaterial) {
			if (clonedMAterial.albedoTexture)
				clonedMAterial.albedoTexture = clonedMAterial.albedoTexture.clone();
			if (clonedMAterial.metallicTexture)
				clonedMAterial.metallicTexture = clonedMAterial.metallicTexture.clone();
			if (clonedMAterial.emissiveTexture)
				clonedMAterial.emissiveTexture = clonedMAterial.emissiveTexture.clone();
			if (clonedMAterial.bumpTexture)
				clonedMAterial.bumpTexture = clonedMAterial.bumpTexture.clone();
			if (clonedMAterial.ambientTexture)
				clonedMAterial.ambientTexture = clonedMAterial.ambientTexture.clone();
		}

		return clonedMAterial;
	}

	private static _cloneTransformNode(orginalNodes: BABYLON.TransformNode[],originalMeshes: BABYLON.AbstractMesh[],clonedMeshes: BABYLON.AbstractMesh[] ,scene: BABYLON.Scene): BABYLON.TransformNode[] {
		const ClonedNodes: BABYLON.TransformNode[] = [];
	
		orginalNodes.forEach((originalNode: BABYLON.TransformNode) => {
			const clonedNode = originalNode.clone(originalNode.name + _suffix, null, false);
			if (!clonedNode)
				return;

			clonedNode.position = originalNode.position.clone();
			clonedNode.rotation = originalNode.rotation.clone();
			clonedNode.scaling = originalNode.scaling.clone();

			if (originalNode.rotationQuaternion)
				clonedNode.rotationQuaternion = originalNode.rotationQuaternion.clone();

			clonedNode.setEnabled(true);
			clonedNode.isVisible = true;

			ClonedNodes.push(clonedNode);
		});
		return ClonedNodes;
	}

	private static _rebuildhierarchies(originalmeshes: BABYLON.AbstractMesh[], clonedMeshes: BABYLON.AbstractMesh[], originalNodes: BABYLON.TransformNode[], clonedNodes: BABYLON.TransformNode[]) {
		const meshMap = new Map<BABYLON.Node, BABYLON.Node>();
		const nodeMap = new Map<BABYLON.Node, BABYLON.Node>();

		originalmeshes.forEach((og: BABYLON.Node, i: number) => meshMap.set(og, clonedMeshes[i]));
		originalNodes.forEach((og: BABYLON.Node, i: number) => nodeMap.set(og, clonedNodes[i]));

		const allNodesMAp = new Map([...meshMap, ...nodeMap]);

		originalmeshes.forEach((originalmesh: BABYLON.AbstractMesh, index: number) => {
			if (originalmesh.parent) {
				const clonedParent = allNodesMAp.get(originalmesh.parent);
				if (clonedParent)
					clonedMeshes[index].parent = clonedParent as BABYLON.Node;
			}
		});

		originalNodes.forEach((originalNode: BABYLON.TransformNode, index: number) => {
			if (originalNode.parent) {
				const clonedParent = allNodesMAp.get(originalNode.parent);
				if (clonedParent)
					clonedNodes[index].parent = clonedParent as BABYLON.Node;
			}
		})
	}

	private static _cloneAnimationGroups(originalGroups: BABYLON.AnimationGroup[], originalMeshes: BABYLON.AbstractMesh[], originalNodes: BABYLON.TransformNode[], clonedMeshes: BABYLON.AbstractMesh[], clonedNodes: BABYLON.TransformNode[], clonedSkeletons: BABYLON.Skeleton[], scene: BABYLON.Scene,
	): BABYLON.AnimationGroup[] {

		const clonedGroups: BABYLON.AnimationGroup[] = [];
		
		const targetMap = new Map<any, any>();
		originalMeshes.forEach((orig, i) => targetMap.set(orig, clonedMeshes[i]));
		originalNodes.forEach((orig, i) => targetMap.set(orig, clonedNodes[i]));
		
		clonedSkeletons.forEach((clonedKesleton :BABYLON.Skeleton, i: number) => {
			if (clonedKesleton.bones && clonedKesleton.bones.length > 0) {
				const ogiskeleton = (clonedKesleton as any)._originalSkeleton ?? null;
				if (ogiskeleton) {
					ogiskeleton.bones.forEach((ogiBone: BABYLON.Bone, j: number) => {
					const clonedBone = clonedKesleton.bones[j];
						if (clonedBone)
							targetMap.set(ogiBone, clonedBone);
					})
				}
			}
		})
		originalGroups.forEach((originalGroup: BABYLON.AnimationGroup) => {
			const clonedGroup = new BABYLON.AnimationGroup(originalGroup.name + _suffix, scene);

			originalGroup.targetedAnimations.forEach((targetedAnim: BABYLON.TargetedAnimation) => {
				const clonedTarget = targetMap.get(targetedAnim.target);

				if (clonedTarget) {
					const clonedAnimation = targetedAnim.animation.clone();
					clonedGroup.addTargetedAnimation(clonedAnimation, clonedTarget);
				}
			});

			clonedGroup.speedRatio = originalGroup.speedRatio;
			clonedGroup.loopAnimation = originalGroup.loopAnimation;
			clonedGroup.stop();

			clonedGroups.push(clonedGroup);
		});

		return clonedGroups;
	}


	private static _cloneSkeketons(originalSkeletons: BABYLON.Skeleton[], originalMeshes: BABYLON.AbstractMesh[], clonedMeshes: BABYLON.AbstractMesh[], scene: BABYLON.Scene): BABYLON.Skeleton[] {

		const clonedSkeletons: BABYLON.Skeleton[] = [];

		originalSkeletons.forEach((originalSkeleton: BABYLON.Skeleton) => {
			const clonedSkeleton: BABYLON.Skeleton = originalSkeleton.clone(originalSkeleton.name + _suffix);
			(clonedSkeleton as any)._originalSkeleton = originalSkeleton;
			if (clonedSkeleton) {
				originalMeshes.forEach((origMesh, i) => {
					if (origMesh.skeleton === originalSkeleton && clonedMeshes[i]) {
						clonedMeshes[i].skeleton = clonedSkeleton;
					}
				});
				if (!scene.skeletons.includes(clonedSkeleton)) {
						scene.addSkeleton(clonedSkeleton);
				}
				clonedSkeletons.push(clonedSkeleton);
			}
		});

		return clonedSkeletons;
	}

	public static _setEnable(Path: string) {
		if (this._meshCache.has(Path)) {
			this._meshCache.get(Path)!.meshes.forEach((mesh: BABYLON.AbstractMesh) => {
				mesh.setEnabled(false);
				mesh.isVisible = false;	
			});
		}
	}

	public static clearCache(): void {
		this._meshCache.forEach((result: BABYLON.ISceneLoaderAsyncResult, path: string) => {
			result.meshes.forEach((mesh: BABYLON.AbstractMesh) => {mesh.dispose();
			});

			result.animationGroups.forEach((Ag: BABYLON.AnimationGroup) => {Ag.dispose();
			});

			result.skeletons.forEach((skeleton: BABYLON.Skeleton) => {skeleton.dispose();
			});
		})

		this._meshCache.clear();
		this._cachedMeshes.clear();
		this._cachedTransformNodes.clear();
		this._cachedAnimationGroups.clear();
		this._cachedSkeletons.clear();
		this._cachedLights.clear();
		this._cachedParticleSystems.clear();
		this._cachedMaterials.clear();
	}

    public static printCacheStats(): void {
			console.log(`📊 Cache Statistics:`);
			console.log(`  Entries: ${this._meshCache.size}`);
		
			this._meshCache.forEach((result, path) => {
			    console.log(`  ${path}:`);
			    console.log(`    Meshes: ${result.meshes.length}`);
			    console.log(`    Animations: ${result.animationGroups.length}`);
				console.log(`    Animations name:`);
				result.animationGroups.forEach(ag => {console.log("-" + ag.name)});
			    console.log(`    Skeletons: ${result.skeletons.length}`);
				console.log(`		Bone: `);
				result.skeletons.forEach((s: BABYLON.Skeleton) => {console.log(`-${s.bones}`)});
				console.log(`    particleSystems: ${result.particleSystems.length}`);
				console.log(`    transformNodes: ${result.transformNodes.length}`);
				console.log(`    geometries: ${result.geometries.length}`);
			});
    }
}