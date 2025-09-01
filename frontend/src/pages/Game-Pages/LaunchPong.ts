import { renderScene } from '../../babylon/displaying/renderScene.js';
import { GamePage } from './GamePage.js';
import { State } from '../../core/state.js';

const state = State.getInstance();

export class launchPong {

	private Render!: renderScene;
	private GamePage!: GamePage

	constructor(Render: renderScene, GamePage: GamePage) {
		this.Render = Render;
		this.GamePage = GamePage;
	}

	render(/*******add IdParty: number or Party: any*********/) {
		this.GamePage.cleanPage();
		this.GamePage.removeOverlayToWindow();
		let lastTime = 0;
		const targetFPS = 120;
		const frameDuration = 1000 / targetFPS;
		let now;
		let delta;
		this.Render.PongGame!.GamePhysics!.setMaxScore = 5;
		window.addEventListener('keydown', (ev) => {
		if (ev.key == "Escape") {
			console.log("escape has been called")
			this.returnLobby();
			}
		});
		this.Render.engine?.runRenderLoop(() => {
			now = performance.now();
			delta = now - lastTime;
			if (delta >= frameDuration) {
				lastTime = now;
				this.Render.pongScene?.render();
			}
			console.log("win ?", this.Render.PongGame?.GamePhysics?.Win);
			if (this.Render.PongGame?.GamePhysics?.Win)
				this.EndGame();
		})
	}

	returnLobby () {
		this.GamePage.cleanBody();
		this.GamePage.startGamePage();
		this.Render.setState = 0;
		this.Render.callRenderLoop();
	}

	private EndGame() {
		this.Render.engine?.stopRenderLoop();
		state.pause();
		this.Render.PongGame!.GamePhysics!.SetWin = false;
		this.returnLobby();
	}
}