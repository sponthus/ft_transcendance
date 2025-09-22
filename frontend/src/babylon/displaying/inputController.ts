/*****************************************************************export class for input Controller*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { renderAnimation } from "./animations";
import { renderAsset } from "../displaying/renderAsset";
import { dialogueBox, sleep } from "./dialogueBox";
import { renderScene } from "./renderScene";

export class PlayerInput {

	private _scene?: BABYLON.Scene;
	private _player?: BABYLON.Mesh;
	private _sandCastle? : BABYLON.Mesh;
	private _npc? : BABYLON.Mesh;
	private _chest? : BABYLON.Mesh;
	private	_animation: renderAnimation
	private _previousAngle: number | null = null; //player angle state

	private _isOpen: boolean;

	private _dialoguePong?: dialogueBox;
	private _dialogueNpc?: dialogueBox;
	private _dialogueChest: dialogueBox;

	private _inputMap: {[key: string]: boolean} = {}; //input keyboard map

	private _renderscene: renderScene;

	constructor (scene: BABYLON.Scene, assets: renderAsset, animation: renderAnimation, renderScene: renderScene) {
		this._scene = scene;
		this._player = assets.playermesh;
		this._sandCastle = assets.sandcastle;
		this._chest = assets.chest;
		this._animation = animation;
		this._npc = assets.npc;
	
		this._renderscene = renderScene;
		this._isOpen = false;

		this._dialoguePong = new dialogueBox("press 'E' to\n play pong", scene, this._sandCastle);
		this._dialogueNpc = new dialogueBox("Hi friend !", scene, this._npc);
		this._dialogueChest = new dialogueBox("press 'E\n to open", scene, this._chest);

		this._setInput();
	}

	private _setInput() {
		/**********************check event***********************/
		this._scene!.actionManager = new BABYLON.ActionManager(this._scene);
		this._scene!.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => {
				this._inputMap[evt.sourceEvent.key.toLowerCase()] = true; }));
		this._scene!.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => {
				this._inputMap[evt.sourceEvent.key.toLowerCase()] = false;
			}));
		this._scene?.onBeforeRenderObservable.add(() => {
			this._updateFromKeyboard();
			this._interactsandCastle();
			this._interactNpc();
			this._interactChest();
		});
	}

	private _updateFromKeyboard() {
		if (!this._player)
		    return ;
		const speed = 0.2;
		let move = new BABYLON.Vector3(0, 0, 0);
		let direction = BABYLON.Vector3.Zero();
		if (this._inputMap['w'] || this._inputMap["arrowup"]) {
			direction.x += 1;
			move.z += speed;
		}
		if (this._inputMap['s'] || this._inputMap["arrowdown"]) {
			direction.x -= 1;
			move.z -= speed;
		}
		if (this._inputMap['a'] || this._inputMap["arrowleft"]) {
			direction.z += 1;
			move.x -= speed;
		}
		if (this._inputMap['d'] || this._inputMap["arrowright"]) {
			direction.z -= 1;
			move.x += speed;
		}
		var tmp = this._player.position;
		tmp.add(move);
		if (direction.equals(BABYLON.Vector3.Zero())) {
			this._animation.stopWalk();
			return ;
		}
		else {
			this._animation.startWalk()
			direction = direction.normalize();
			const gravity = this._scene!.gravity;
			move = move.add(gravity);
			this._player.moveWithCollisions(move);
			const angle = Math.atan2(direction.x, direction.z);
			const correctionAngle = Math.PI / 2;
			const finalAngle = angle + correctionAngle;
			if (this._previousAngle == null || Math.abs(finalAngle - this._previousAngle) > 0.1) {
				this._player.rotation.y = finalAngle;
				this._previousAngle = finalAngle;
			}
		}
	}

	private async _interactsandCastle() {
		const proximityThreshold = 10;
		if (this._player && this._sandCastle) {
			const distance = BABYLON.Vector3.Distance(this._sandCastle.position, this._player.position);
			if (distance < proximityThreshold && !this._dialoguePong?._isvisible()) {
				this._dialoguePong!.showDialogue();
				console.log("showing dialogue", this._dialoguePong?._isvisible());
			}
			else if (distance > proximityThreshold && this._dialoguePong?._isvisible()) {
				this._dialoguePong!.hideDialogue();
				this._dialoguePong.clearDialogue();
			}
			if (this._dialoguePong?._isvisible()) {
				if (this._inputMap['e'] ||  this._inputMap['E']){
					console.log("launch Game");

					this._dialoguePong!.hideDialogue();
					this._inputMap['e'] = false;
					this._inputMap['E'] = false;
					this._renderscene.setState = 1;
					this._scene?.getEngine().displayLoadingUI();
					await sleep(500);
					this._scene?.getEngine().hideLoadingUI();
				}
			}
		}
	}

	private async _interactNpc() {
		const proximityThreshold = 5;
		if (this._player && this._npc) {
			const distance = BABYLON.Vector3.Distance(this._player.position, this._npc.getAbsolutePosition())
			// console.log("distance between player and npc", distance);
			if (distance < proximityThreshold && !this._dialogueNpc?._isvisible()) {
				this._dialogueNpc?.showDialogue();
				await sleep(2000);
				if (this._dialogueNpc?.msg != "How are you\n today ?")
					this._dialogueNpc?.changeDialogue("How are you\n today ?");
			}
			else if (distance > proximityThreshold) {
				this._dialogueNpc?.hideDialogue();
				this._dialogueNpc?.changeDialogue("Hi friend !");
				await sleep(5000);
			}
		}
	}

	private _interactChest() {
		const proximityThreshold = 5;
		if (this._player && this._chest) {
			const distance = BABYLON.Vector3.Distance(this._player.position, this._chest.position) 
			// console.log("distance between player and chest", distance, this._dialogueChest?._isvisible);
			if (distance < proximityThreshold && !this._dialogueChest?._isvisible()) {
				console.log('showing chest dialogue');
				this._dialogueChest.showDialogue();
			}
			else if (distance > proximityThreshold) {
				this._dialogueChest.hideDialogue();
				if (this._isOpen) {
					this._animation.startClose();
					this._isOpen = false;
				}
			}
			if (this._dialogueChest?._isvisible()) {
				if (this._inputMap['e'] ||  this._inputMap['E']) {
					if (!this._isOpen) {
						this._animation.startOpen();
						this._isOpen = true;
						this._inputMap['e'] = false;
						this._inputMap['E'] = false;
					}
				}
			}
		}
	}

	get	inputMap(): {[key: string]: boolean} {
		return this._inputMap;
	}
}