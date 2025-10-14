/*****************************************************************export class for input Controller*****************************************************************/

import "@babylonjs/core/Debug/debugLayer";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { renderAnimation } from "./animations";
import { renderAsset } from "../displaying/renderAsset";
import { dialogueBox, sleep } from "./dialogueBox";
import { renderScene } from "./renderScene";
import { Player } from "./characterController";

export class PlayerInput {

	private _scene?: BABYLON.Scene;
	private _player?: BABYLON.Mesh;
	private _sandCastle? : BABYLON.Mesh;
	private _npc? : BABYLON.Mesh;
	private _chest? : BABYLON.Mesh;
	private	_animation: renderAnimation
	private _previousAngle: number | null = null; //player angle state

	private _isOpen: boolean;
	private _npcTimerStarted: boolean = false;

	private _dialoguePong?: dialogueBox;
	private _dialogueNpc?: dialogueBox;
	private _dialogueChest: dialogueBox;

	private _inputMap: {[key: string]: boolean} = {}; //input keyboard map

	private _renderscene: renderScene;

	private static readonly SPEED = 0.2;
	private static readonly PROXIMITY_SANDCASTLE = 10;
	private static readonly PROXIMITY_NPC = 5;
	private static readonly PROXIMITY_CHEST = 5;
	private static readonly ANGLE_THRESHOLD = 0.1;
	private static readonly CORRECTION_ANGLE = Math.PI / 2;

	private _moveVector: BABYLON.Vector3 = BABYLON.Vector3.Zero();
	private _directionVector: BABYLON.Vector3 = BABYLON.Vector3.Zero();

	private _lastSandCastleCheck = 0;
	private _lastNpcCheck = 0;
	private _lastChestCheck = 0;
	private static readonly CHECK_INTERVAL = 100;

	constructor (scene: BABYLON.Scene, assets: renderAsset, animation: renderAnimation, renderScene: renderScene) {
		this._scene = scene;
		this._player = assets.playermesh;
		this._sandCastle = assets.sandcastle;
		this._chest = assets.chest;
		this._animation = animation;
		this._npc = assets.npc;
	
		this._renderscene = renderScene;
		this._isOpen = false;
		this._animation.startClose();

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
				this._inputMap[evt.sourceEvent.key.toLowerCase()] = false;}));

		this._scene?.onBeforeRenderObservable.add(async() => {
			this._animation.animateTrees();
			this._animation.animateBoat();
			this._updateFromKeyboard();
			this.checkInteraction();
		});
	}

	private  _updateFromKeyboard() {
		if (!this._player)
		    return ;
		const speed = 0.15;

		this._moveVector.set(0, 0, 0);
		this._directionVector.set(0, 0, 0);

		let hasMovement = false;

		if (this._inputMap['w'] || this._inputMap["arrowup"]) {
			this._directionVector.x += 1;
			this._moveVector.z += speed;
			hasMovement = true;
		
		}
	
		if (this._inputMap['s'] || this._inputMap["arrowdown"]){
			this._directionVector.x -= 1;
			this._moveVector.z -= speed;
			hasMovement = true;
		}
	
		if (this._inputMap['a'] || this._inputMap["arrowleft"]){
			this._directionVector.z += 1;
			this._moveVector.x -= speed;
			hasMovement = true;
		}

		if (this._inputMap['d'] || this._inputMap["arrowright"]) {
			this._directionVector.z -= 1;
			this._moveVector.x += speed;
			hasMovement = true;
		}

		if (!hasMovement) {
			this._animation.stopWalk();
			return ;
		}

		this._animation.startWalk()
		this._directionVector.normalize();
	
		const gravity = this._scene!.gravity;
		this._moveVector.addInPlace(gravity);
		this._player.moveWithCollisions(this._moveVector);
	
		const angle = Math.atan2(this._directionVector.x, this._directionVector.z) + PlayerInput.CORRECTION_ANGLE;
		if (this._previousAngle == null || Math.abs(angle - this._previousAngle) > 0.1) {
			this._player.rotation.y = angle;
			this._previousAngle = angle;
		}
	}

	private checkInteraction() {
		const now = Date.now();

		if (now - this._lastSandCastleCheck > PlayerInput.CHECK_INTERVAL) {
			this._interactsandCastle();
			this._lastSandCastleCheck = now;
		}

		if (now - this._lastNpcCheck > PlayerInput.CHECK_INTERVAL) {
			this._interactNpc();
			this._lastNpcCheck = now;
		}
		if (now - this._lastChestCheck > PlayerInput.CHECK_INTERVAL) {
			this._interactChest();
			this._lastChestCheck = now;
		}
	}

	private  _interactsandCastle() {
		if (this._player && this._sandCastle && this._dialoguePong) {
			const distance = BABYLON.Vector3.DistanceSquared(this._sandCastle.position, this._player.position);
			
			const thresholdSq = PlayerInput.PROXIMITY_SANDCASTLE ** 2;

			if (distance > thresholdSq) {
				if (this._dialoguePong?._isvisible()) {
					this._dialoguePong!.hideDialogue();
					this._dialoguePong.clearDialogue();
				}
				return ;
			}
			if (!this._dialoguePong?._isvisible()) 
				this._dialoguePong!.showDialogue();

			if (this._dialoguePong?._isvisible()) {
				if (this._inputMap['e'] ||  this._inputMap['E']){
					this._dialoguePong!.hideDialogue();
					this._inputMap['e'] = false;
					this._inputMap['E'] = false;
					this._renderscene.setState = 1;
				}
			}
		}
	}

	private  _interactNpc() {
		if (this._player && this._npc && this._dialogueNpc) {
			const distance = BABYLON.Vector3.DistanceSquared(this._player.position, this._npc.getAbsolutePosition())

			const thresholdSq = PlayerInput.PROXIMITY_NPC **2;

			// console.log("distance between player and npc", distance);
			if (distance > thresholdSq) {
				if (this._dialogueNpc._isvisible()) {
					this._dialogueNpc?.hideDialogue();
					this._dialogueNpc?.changeDialogue("Hi friend !");
					this._npcTimerStarted = false;
				}
				return ;
			}
			if (!this._dialogueNpc._isvisible())
				this._dialogueNpc?.showDialogue();
			if (distance < thresholdSq) {
				if (!this._npcTimerStarted ) {
					this._npcTimerStarted = true;
					setTimeout(() => {
						if (this._dialogueNpc && this._dialogueNpc.msg !== "How are you\n today ?") {
							this._dialogueNpc?.changeDialogue("How are you\n today ?");
						}
					}, 2000);
				}
			}
		}
	}

	private  _interactChest() {
		if (this._player && this._chest && this._dialogueChest) {
			const distance = BABYLON.Vector3.DistanceSquared(this._player.position, this._chest.position);

			const thresholdSq = PlayerInput.PROXIMITY_NPC ** 2;

			if (distance > thresholdSq) {
				if (this._dialogueChest._isvisible())
					this._dialogueChest.hideDialogue();
				if (this._isOpen) {
					this._animation.startClose();
					this._isOpen = false;
				}
				return;
			}

			if (!this._dialogueChest?._isvisible())
				this._dialogueChest.showDialogue();

			if ((this._inputMap['e'] ||  this._inputMap['E']) && !this._isOpen) {
				this._animation.startOpen();
				this._isOpen = true;
				this._inputMap['e'] = false;
				this._inputMap['E'] = false;
			}
		}
	}

	get	inputMap(): {[key: string]: boolean} {
		return this._inputMap;
	}
}