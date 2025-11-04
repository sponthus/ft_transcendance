import * as BABYLON  from "@babylonjs/core";
import { LoadingScreen } from "../displaying/loadingScreen";

export class BabylonEngineCache {
	private static _EngineCache: Map<string, BABYLON.Engine> = new Map();
	private static _CanvasCache: Map<string, HTMLCanvasElement> = new Map();

	public static _LoadEngineWithCache(Name: string, canvas: HTMLCanvasElement): BABYLON.Engine {
		if (this._EngineCache.has(Name))	
			return this._EngineCache.get(Name)!;
		const engine = new BABYLON.Engine(canvas, true);
		if (!engine)
			throw new Error("Engine Failed to load");

		this._EngineCache.set(Name, engine);
		return engine;
	}
	
	public static _loadCanvasWithCache(Name: string): HTMLCanvasElement {
		/**********************canvas builder***********************/
		if (this._CanvasCache.has(Name))
			return this._CanvasCache.get(Name)!;
		const canvas = document.createElement("canvas");
		if (!canvas)
			throw new Error("Canvas failed to load");
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.id = Name;

		this._CanvasCache.set(Name, canvas);
		return canvas;
	}

	public static _clearCache() {
		this._EngineCache.forEach((Engine, Name) => {
			Engine.stopRenderLoop();
			Engine.dispose();
		});
		this._EngineCache.clear();
		this._CanvasCache.forEach((Canvas, Name) => {
			if (Canvas.parentElement)
				Canvas.parentElement.removeChild(Canvas);
		});
		this._CanvasCache.clear();
	}
}
