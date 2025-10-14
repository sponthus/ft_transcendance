import { renderScene } from '../../babylon/displaying/renderScene.js';
import { GamePage } from './GamePage.js';
import { ErrorPopup } from '../ErrorPage.js';

export class launchPong {

	private Render!: renderScene;
	private GamePage!: GamePage;

	private tournament!: boolean;

	constructor(Render: renderScene, GamePage: GamePage) {
		this.Render = Render;
		this.GamePage = GamePage;
		this.tournament = false;
	}

	async render(gameId: number, tournament: boolean) {
		this.tournament = tournament;
		this.GamePage.cleanPage();
		this.GamePage.removeOverlayToWindow();
		let lastTime = 0;
		const targetFPS = 60;
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
		try {
			this.Render.PongGame?.GamePhysics?.launchSocket(gameId);
		} catch(error) {
			await ErrorPopup("Error launching pong websocket");
			this.returnLobby();
		}
		this.Render.engine?.runRenderLoop(() => {
			now = performance.now();
			delta = now - lastTime;
			if (delta >= frameDuration) {
				lastTime = now;
				this.Render.pongScene?.render();
			}
			// console.log("win ?", this.Render.PongGame?.GamePhysics?.Win);
			if (this.Render.PongGame?.GamePhysics?.Win)
				this.EndGame(gameId);
		})
	}

	returnLobby () {
		this.GamePage.cleanPage();
		this.GamePage.cleanBody();
		this.GamePage.startGamePage();
		this.Render.setState = 0;
		this.GamePage.removeOverlayToWindow();
		this.Render.callRenderLoop();
	}

	private EndGame(id: number) {
		this.Render.engine?.stopRenderLoop();
		this.Render.PongGame!.GamePhysics!.stopGame(); // Close socket
		this.Render.PongGame!.GamePhysics!.SetWin = false;
		this.GamePage.addOverlayToWindow();
		if (this.tournament && this.GamePage._tournamentPage._tournamentId && !this.GamePage._tournamentPage._isFinal)
			this.GamePage.generateBracketTournament(this.GamePage._tournamentPage._tournamentId!);
		else {
			if (this.tournament && this.GamePage._tournamentPage._tournamentId)
				this.GamePage.generateEndGamePage(this.tournament, this.GamePage._tournamentPage._tournamentId);
			else
				this.GamePage.generateEndGamePage(this.tournament, id);
		}
	}

	set setTournament(tournament:boolean) {
		this.tournament = tournament;
	}
}