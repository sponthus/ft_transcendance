/*****************************************************************export class for dialogue*****************************************************************/

import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class dialogueBox {

	private _dialogue: BABYLON.Mesh;
	private _texture: GUI.AdvancedDynamicTexture;
	private _dialoguetext: GUI.TextBlock;

	private _msg: string;

	constructor(msg: string, scene: BABYLON.Scene, mesh: any) {
		
		this._msg = msg;

		this._dialogue = BABYLON.MeshBuilder.CreatePlane("dialogue", {width: screen.width * 0.04, height: screen.height *0.04}, scene);
		this._dialogue.position = mesh.getAbsolutePosition().add(new BABYLON.Vector3(0, 7, 0));
		this._dialogue.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		this._dialogue.setEnabled(false);

		this._texture = GUI.AdvancedDynamicTexture.CreateForMesh(this._dialogue);

		this._dialoguetext = new GUI.TextBlock;
		this._dialoguetext.color = "white"
		this._dialoguetext.fontSize = 22;
		this._dialoguetext.fontFamily = "Gloria Hallelujah";
		this._dialoguetext.textWrapping = true;
		this._dialoguetext.text = msg;

		this._texture.addControl(this._dialoguetext);
	}

	private async _typeText() {
		for (let index: number = 0; index < this._msg.length; index++) {
			this._dialoguetext.text = this._msg.slice(0, index + 1);
			if (!this._dialogue.isEnabled())
				break ;
			await sleep(50);
		}
	}

	_isvisible(): boolean {
		return this._dialogue.isEnabled();
	}

	showDialogue() {
		this._dialogue.setEnabled(true);
		this._typeText();
	}

	hideDialogue() {
		this._dialogue.setEnabled(false);
	}

	changeDialogue(msg: string) {
		this._dialoguetext.text = "";
		this._msg = msg;
		this._typeText();
	}

	clearDialogue() {
		this._dialoguetext.text = "";
	}
	get msg(): string {
		return this._msg;
	}
}