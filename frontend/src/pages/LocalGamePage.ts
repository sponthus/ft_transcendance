import { PongGame } from "../babylon/pong/pong_game.js";
import { BasePage } from "./BasePage.js";

export class LocalGamePage extends BasePage {
    constructor() {
        super();
    }

    // Possibility : If several game modes are available = inherits from a game page with several players
    async render(): Promise<void> {
        await this.renderBanner();
        // TODO = Check user connexion
        // const res = await checkLog();
        // if (!res.ok) {
        //     await navigate('/login');
        //     return;
        // }

        this.app.innerHTML = `<h1>Loading game...</h1>`;
        // Insert here logic to check which game to join + ws initialization

        // Show game options
        this.app.innerHTML = `
            <h1>Local game</h1>
            <p>Controls : ⬆️ ⬇️ (not implemented - auto right now) and  🇦 🇩  - Pause : SPACE bar (not implemented)</p>
            <div id="score"> Score : </div>
            <canvas id="game"> Game canvas. </canvas>
        `;

        const canvas = document.getElementById('game') as HTMLCanvasElement;
        if (!canvas) {
            console.error("Canvas element not found.");
            return;
        }
        // this.resizeCanvas(canvas);

        const pongGameApp = new PongGame();
        await pongGameApp.start();
        console.log("Pong game created");
    }

    // // TODO = Add this in a listener of resizing ?
    // resizeCanvas(canvas: HTMLCanvasElement) {
    //     if (window.innerWidth * 0.6 >= 900)
    //         state.canvas.width = window.innerWidth * 0.6;
    //     else
    //         state.canvas.width = 900;
    //     state.canvas.height = state.canvas.width * 2/3;
    //     canvas.width = state.canvas.width;
    //     canvas.height = state.canvas.height;
    // }
}
