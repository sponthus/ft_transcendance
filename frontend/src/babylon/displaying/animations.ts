/*****************************************************************export class for anim character*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { renderAsset } from "./renderAsset";

export class renderAnimation {

	private _scene: BABYLON.Scene;

	/****************for animation player**************/
	private _walkAnimation: BABYLON.AnimationGroup | null = null;
	private _idleAnimation: BABYLON.AnimationGroup | null = null;

	private _idleNpcAnimation: BABYLON.AnimationGroup | null = null;

	private _openChest: BABYLON.AnimationGroup | null = null;
	private _closeChest: BABYLON.AnimationGroup | null = null;

	private _renderAsset!: renderAsset;

	constructor (scene: BABYLON.Scene, renderAsset: renderAsset) {
		this._scene = scene;
		this._renderAsset = renderAsset;

		this._walkAnimation = this._scene?.getAnimationGroupByName("walk");
		if (!this._walkAnimation)
			throw new Error("Failed to load walk animation");
	
		this._idleAnimation = this._scene?.getAnimationGroupByName("idle");
		if (!this._idleAnimation)
			throw new Error("Failed to load idle animation");
	
		this. _idleNpcAnimation = this._scene?.getAnimationGroupByName("npc_idle");
		if (!this._idleNpcAnimation)
			throw new Error("Failed to load npc_idle animation");
	
		this._openChest = this._scene?.getAnimationGroupByName("open_chest_clone");
		if (!this._openChest)
			throw new Error("Failed to load open animation");
	
		this.stopOpen();
		this._closeChest = this._scene?.getAnimationGroupByName("close_chest_clone");
		if (!this._closeChest)
			throw new Error("Failed to load close animation");
	}

	animateTrees() {
		if (!this._renderAsset.bendTrees)
			return ;
		const T = performance.now() * 0.003;
		
		this._renderAsset.bendTrees.forEach((tree, i) => {
			const sway = Math.sin(T + i * 0.3) * 0.05;
			const tilt = Math.cos(T * 0.8 + i * 0.5) * 0.02;

			tree.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(sway, tilt, 0);
		})

		if (!this._renderAsset.straightTrees)
			return ;

		this._renderAsset.straightTrees.forEach((tree, i ) =>{
			const sway = Math.sin(T + i * 0.3) * 0.05;
			const tilt = Math.cos(T * 0.8 + i * 0.5) * 0.02;

			tree.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(sway, tilt, 0);
		})

		if (this._renderAsset.leafShader) {
		    const t = performance.now() * 0.004;
		    this._renderAsset.leafShader.setFloat("time", t);
		}
	}

	animateBoat() {
		if (!this._renderAsset.pirateBoat)
			return ;

		const T = performance.now() * 0.002;
		const sway = Math.sin(T * 0.3) * 0.04;
		const tilt = Math.cos(T * 0.4) * 0.01;
		const bob = Math.sin(T * 0.5) * 0.05;
		
		this._renderAsset.pirateBoat.rotation.y = sway;
		this._renderAsset.pirateBoat.rotation.x = tilt;
		this._renderAsset.pirateBoat.position.y += bob * 0.01;


		if (!this._renderAsset.sandcastle)
			return ;

		const T2 = performance.now() * 0.002;
		const sway2 = Math.sin(T2 * 0.3) * 0.04;
		const tilt2 = Math.cos(T2 * 0.4) * 0.01;
		const bob2 = Math.sin(T2 * 0.5) * 0.05;
		this._renderAsset.sandcastle.rotation.y = sway2;
		this._renderAsset.sandcastle.rotation.x = tilt2;
		this._renderAsset.sandcastle.position.y += bob2 * 0.01;
	}

	startWalk() {
		if (this._walkAnimation)
			this._walkAnimation.start(true, 1.0, this._walkAnimation.from, this._walkAnimation.to, false);
	}

	stopWalk() {
		if (this._walkAnimation)
			this._walkAnimation.stop();
	}

	startidle() {
		if (this._idleAnimation)
			this._idleAnimation.start(true, 0.5, this._idleAnimation.from, this._idleAnimation.to, false);
	}

	stopidle() {
		if (this._idleAnimation)
			this._idleAnimation.stop();
	}

	startidlenpc() {
		if (this._idleNpcAnimation)
			this._idleNpcAnimation.start(true, 0.5, this._idleNpcAnimation.from, this._idleNpcAnimation.to, false);
	}

	stopidlenpc() {
		if (this._idleNpcAnimation)
			this._idleNpcAnimation.stop();
	}

	startOpen() {
		if (this._openChest)
			this._openChest.start(false, 1.0, this._openChest.from, this._openChest.to, false);
	}

	stopOpen() {
		if (this._openChest)
			this._openChest.stop();
	}

	startClose() {
		if (this._closeChest)
			this._closeChest.start(false, 1.0, this._closeChest.from, this._closeChest.to, false);
	}

	stopClose() {
		if (this._closeChest)
			this._closeChest.stop();
	}

	get walkAnimation(): BABYLON.AnimationGroup | null {
		return this._walkAnimation;
	}

	get idleAnimation(): BABYLON.AnimationGroup | null  {
		return this._idleAnimation;
	}
}