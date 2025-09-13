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
		this._scene = scene;
		this._engine = engine;
	
		this.initializeCamera();
		this.initializeLight();
		this.initializeBall();
	}

	private initializeCamera()
    {
        this._camera = new Babylon.ArcRotateCamera(
            "camera",
            Math.PI,
            0.8,
            25,
            Babylon.Vector3.Zero(),
            this._scene
        );
        window.addEventListener("keydown", (evt) => {
            switch (evt.key) {
                case "ArrowUp":
                    this._camera.setPosition(new Babylon.Vector3(0, 20, 0));
                    this._camera.alpha = 3.14;          // angle horizontal
                    //this._camera.beta = 0.5;         // angle vertical (vue du dessus)
                    this._camera.setTarget(Babylon.Vector3.Zero());
                    break;
                case "ArrowDown":
                    this._camera.setPosition(new Babylon.Vector3(-20, 10, 0));
                    this._camera.setTarget(Babylon.Vector3.Zero());
                    break;
                case "ArrowLeft":
                    this._camera.setPosition(new Babylon.Vector3(0, 10, 20));
                    this._camera.setTarget(Babylon.Vector3.Zero());
                    break;
                case "ArrowRight":
                    this._camera.setPosition(new Babylon.Vector3(0, 10, -20));
                    this._camera.setTarget(Babylon.Vector3.Zero());
                    break;
            }
        });
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
		this._ball.position.y = 0;
		//this._ball.direction = new Babylon.Vector3(0.1, 0, 0.5);
		this._ball.direction = Babylon.Vector3.Zero();
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

	get light(): Babylon.HemisphericLight
	{
		return this._light;
	}
}