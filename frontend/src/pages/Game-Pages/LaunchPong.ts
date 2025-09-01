import { renderScene } from '../../babylon/displaying/renderScene.js';

export class launchPong {

	private Render!: renderScene;

	constructor(Render: renderScene) {
		this.Render = Render;
	}

	render(/*******add IdParty: number or Party: any*********/) {
		let lastTime = 0;
		const targetFPS = 120;
		const frameDuration = 1000 / targetFPS;
		let now;
		let delta;
		window.addEventListener('keydown', (ev) => {
		if (ev.key == "Escape") {
			console.log("escape has been called")
			this.Render.engine?.stopRenderLoop();
			this.Render.setState = 0;
			this.Render.callRenderLoop();
			}
		});
		this.Render.engine?.runRenderLoop(() => {
			now = performance.now();
			delta = now - lastTime;
			if (delta >= frameDuration) {
				lastTime = now;
				this.Render.pongScene?.render();
			}
		})
	}

	returnLobby () {
		this.Render.setState = 0;
		this.Render.engine?.stopRenderLoop();
		this.Render.callRenderLoop();
	}
}