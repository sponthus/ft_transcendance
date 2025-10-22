import { BabylonSceneBuilder } from "./displayGame/scene_maker";
import { DisplayAssets } from "./displayGame/display_Assets";
import { GamePhysics } from "./displayGame/game_Physics";

import * as Babylon from "@babylonjs/core"

export class PongGame  {
	private _sceneBuilder?: BabylonSceneBuilder;
	private _displayAssets?: DisplayAssets;
	private _gamePhysics?: GamePhysics;

	constructor() {}

	public async start(scene: Babylon.Scene, canvas: HTMLCanvasElement, engine: Babylon.Engine): Promise<void> {
		this._sceneBuilder = new BabylonSceneBuilder(scene, canvas,  engine);

		if (this._sceneBuilder)
		{
			if (this._sceneBuilder.scene && !this._sceneBuilder.scene.isDisposed) {
				this._displayAssets = new DisplayAssets(
					this._sceneBuilder.scene
				);
				await this._displayAssets.load();
			}

			if (this._sceneBuilder.scene && !this._sceneBuilder.scene.isDisposed && this._displayAssets) {
				this._gamePhysics = new GamePhysics(
					this._sceneBuilder!.ball!,
					this._sceneBuilder!.scene,
					this._sceneBuilder!.engine,
					this._displayAssets.crab1,
					this._displayAssets.crab2,
					this._displayAssets.bullBob,
					this._displayAssets.bullPatrick,
					this._displayAssets.menuPause,
					this._displayAssets.menuPauseSansCrab,
					this._displayAssets.pancartePlayer1,
					this._displayAssets.pancartePlayer2,
					this._sceneBuilder!.light
				);
			}
		}
	}

	get GamePhysics(): GamePhysics | null{
		if (this._gamePhysics)
			return this._gamePhysics;
		return null;
	}
}
