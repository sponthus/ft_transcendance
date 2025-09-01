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
			this._displayAssets = new DisplayAssets(
				this._sceneBuilder.scene
			);
			await this._displayAssets.load();

			this._gamePhysics = new GamePhysics(
				this._sceneBuilder!.ball!,
				this._sceneBuilder!.scene,
				this._sceneBuilder!.engine,
				this._displayAssets.crab1,
				this._displayAssets.crab2
			);
		}
	}

}
