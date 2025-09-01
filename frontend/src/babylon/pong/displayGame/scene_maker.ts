import * as Babylon from "@babylonjs/core"

interface BallMesh extends Babylon.Mesh {
  direction: Babylon.Vector3;
  speed: number;
}

export class BabylonSceneBuilder
{
	private _canvas: HTMLCanvasElement;

	private _engine!: Babylon.Engine;
	private _scene!: Babylon.Scene;
	private _camera!: Babylon.ArcRotateCamera;
	private _light!: Babylon.HemisphericLight;
	private _ball: BallMesh | null = null;

	constructor(scene: Babylon.Scene, canvas: HTMLCanvasElement, engine: Babylon.Engine)
	{
		this._canvas = canvas;
		this._scene = scene
		this._engine = engine;
	
		this.initializeCamera();
		this.initializeLight();
		this.initializeBall();
	}

	private initializeCamera()
	{
		this._camera = new Babylon.ArcRotateCamera("camera", 3.14, 0, 25, Babylon.Vector3.Zero(), this._scene);
		this._camera.attachControl(this._canvas, true);

		this._camera.upperBetaLimit = 1.3;
		this._camera.lowerRadiusLimit = 10;
		this._camera.upperRadiusLimit = 30;
	}

	private initializeLight()
	{
		this._light = new Babylon.HemisphericLight("light", new Babylon.Vector3(1, 1, 0), this._scene);
		this._light.intensity = 1;
	}

	private initializeBall()
	{
		//this._ball = Babylon.MeshBuilder.CreateBox("ball", {width: 0.5, height: 0.5, depth:0.5}) as BallMesh;
		this._ball = Babylon.MeshBuilder.CreateSphere("ball", { diameter: 0.5}, this._scene) as BallMesh;
		this._ball.position.y = 0.4;
		//this._ball.direction = new Babylon.Vector3(0.1, 0, 0.5);
		this._ball.direction = new Babylon.Vector3(
						Math.random() * 0.2 - 0.1,
						0,
						Math.random() > 0.5 ? 0.15 : -0.15
					).normalize();
		this._ball.speed = 0;
	}

	get ball(): BallMesh | null 
	{
		if (!this._ball)
			throw new Error("");
		return this._ball;
	}

	get scene(): Babylon.Scene
	{
		return this._scene;
	}

	get engine(): Babylon.Engine
	{
		return this._engine;
	}
}