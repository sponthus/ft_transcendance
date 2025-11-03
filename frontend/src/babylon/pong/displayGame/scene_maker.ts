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

	private initializeCamera() {
		if (this.scene && this.scene.cameras.length === 1) {
			this._camera = this._scene.cameras[0] as Babylon.ArcRotateCamera;
			return ;
		}
			this._camera = new Babylon.ArcRotateCamera(
				"camera",
				Math.PI,
				0.8,
				25,
				Babylon.Vector3.Zero(),
				this._scene
			);

			const animateCameraPosition = (newPos: Babylon.Vector3) => {
				const anim = new Babylon.Animation(
					"camMove",
					"position",
					60,
					Babylon.Animation.ANIMATIONTYPE_VECTOR3,
					Babylon.Animation.ANIMATIONLOOPMODE_CONSTANT
				);

				anim.setKeys([
					{ frame: 0, value: this._camera.position.clone() },
					{ frame: 60, value: newPos }
				]);

				this._camera.animations = [];
				this._camera.animations.push(anim);
				this._scene.beginAnimation(this._camera, 0, 60, false);
			};

			window.addEventListener("keydown", (evt) => {
				switch (evt.key) {
					case "ArrowUp":
						animateCameraPosition(new Babylon.Vector3(-1, 28, 0));
						break;
					case "ArrowDown":
						animateCameraPosition(new Babylon.Vector3(-20, 10, 0));
						break;
					case "ArrowLeft":
						animateCameraPosition(new Babylon.Vector3(0, 10, 20));
						break;
					case "ArrowRight":
						animateCameraPosition(new Babylon.Vector3(0, 10, -20));
						break;
				}
			});
		}

	private initializeLight()
	{
		if (this._scene && this._scene.lights.length === 1) {
			this._light = this._scene.lights[0] as Babylon.HemisphericLight;
			return ;
		}
		this._light = new Babylon.HemisphericLight("light", new Babylon.Vector3(1, 1, 0), this._scene);
		this._light.intensity = 1;
	}

	private initializeBall()
	{
		this._ball = Babylon.MeshBuilder.CreateSphere("ball", { diameter: 0.5}, this._scene) as BallMesh;
		this._ball.position.y = 0;
		this._ball.direction = Babylon.Vector3.Zero();
		this._ball.speed = 0;
	}

	get ball(): BallMesh | null 
	{
		if (!this._ball)
			throw new Error("Failed to load ball");
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