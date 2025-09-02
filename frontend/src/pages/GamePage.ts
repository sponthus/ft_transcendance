import { checkLog } from "../api/user-service/connection/check-log.js";
import { navigate } from '../core/router.js';
import { BasePage } from "./BasePage.js";
import * as BABYLON from "@babylonjs/core";
import { createLocalGame, getAvailableGames, startGame, deleteGame } from "../api/game.js"
import { popUp } from '../Utils/popUp.js';
import { renderScene } from '../babylon/displaying/renderScene.js';
import { getUserInfo } from "../api/user-service/user-info/getUserInfo.js";

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
    id: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
};

export class GamePage extends popUp {

	private Page!: HTMLElement;

	private scene: BABYLON.Scene;
	private engine: BABYLON.Engine;
	private render: renderScene;
	// private PopUp?: popUp;

    constructor(scene: BABYLON.Scene, engine: BABYLON.Engine, render: renderScene) {
		super("Create Game");
		this.scene = scene as  BABYLON.Scene;
		this.engine = engine;
		this.render = render;
		console.log("generate Game Page");
		this.Page = document.createElement('div');
		this.Page.className = "h-full w-full"
		this.initPopUpPage();
		this.generateGamePage();
    }

	initPopUpPage() {
		this._Body.className = "h-[50%] w-[50%] bg-orange-300 rounded-xl border-2 border-orange-400";
	}

    async launchGame(gameId: number) {
        try {
            const request = await startGame(gameId);
            if (!request.ok) {
                throw new Error('Unable to start game : ' + request.error);
            }
           // state.launchGame(gameId);
			this.removeOverlayToWindow();
			let lastTime = 0;
			const targetFPS = 120;
			const frameDuration = 1000 / targetFPS;
			let now;
			let delta;
			window.addEventListener('keydown', (ev) => {
			if (ev.key == "Escape") {
				console.log("escape has been called")
				this.engine.stopRenderLoop();
				const state = 0;
				this.render.setState = 0;
				this.render.callRenderLoop();
				}
			});

			this.engine.runRenderLoop(() => {
				now = performance.now();
				delta = now - lastTime;
				if (delta >= frameDuration) {
					lastTime = now;
					this.scene.render();
				}
			})
           
        } catch (error) {
            alert(error);
            await navigate('/game');
        }
    }
 
    async deleteGame(gameId: number, userData: UserData) {
        try {
            const request = await deleteGame(gameId);
            if (!request.ok) {
                throw new Error('Unable to delete game : ' + request.error);
            }
            alert("Game deleted");
        } catch (error) {
            alert(error);
        }
        await this.refreshAvailableGames(userData);
    }

    async refreshAvailableGames(userData: UserData) {
        const availableGamesDiv = document.getElementById('available-games');
        if (!availableGamesDiv) {
            console.log('availableGames debug');
            this.Page.innerHTML = `Error`;
            return;
        }

        try {
            // GET games for userId
            const result = await getAvailableGames(userData.id);
            if (!result.ok) {
                availableGamesDiv.innerHTML = 'Error loading games.';
                return;
            }
            const games = result.games;

            // Render list of available games, possibility to show more info about each game if needed
            if (games.length === 0) {
                availableGamesDiv.innerHTML = '<p>No games available</p>';
            } else {
                availableGamesDiv.innerHTML = games.map((game: any) => `
                <div class="game-item" style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
                    <h3>Game #${game.id}</h3>
                    <p><strong>Players:</strong> ${game.player_a} vs ${game.player_b}</p>
                    <p><strong>Status:</strong> ${game.status}</p>
                    <p><strong>Created:</strong> ${game.created_at}</p>
                    <button class="play-btn" data-game-id="${game.id}" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                        ▶️ Play
                    </button>
                    <button class="delete-btn" data-game-id="${game.id}" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                        ❌ Delete
                    </button>
                </div>
                `).join('');

                // Add functionality for "Play button"
                document.querySelectorAll('.play-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const gameIdStr = (e.target as HTMLElement).getAttribute('data-game-id');
                        const gameId = gameIdStr ? parseInt(gameIdStr, 10) : 0;
                        if (gameId == 0)
                            return;
                        console.log('Play button clicked for gameId ' + gameId);
                        await this.launchGame(gameId);
                    });
                });

                // Add functionality for "Delete button"
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const gameIdStr = (e.target as HTMLElement).getAttribute('data-game-id');
                        const gameId = gameIdStr ? parseInt(gameIdStr, 10) : 0;
                        if (gameId == 0)
                            return;
                        console.log('Delete button clicked for gameId ' + gameId);
                        await this.deleteGame(gameId, userData);
                    });
                });
            }
        }
        catch (error) {
            console.error('Error fetching games:', error);
            availableGamesDiv.innerHTML = '<p>Error loading games</p>';
        }
    }

    // Add functionality : only 1 checkbox is available
    meCheckBox1ChoiceOnly(playerAMeCheckbox: HTMLInputElement, 
        playerBMeCheckbox: HTMLInputElement, 
        playerAInput: HTMLInputElement, 
        playerBInput: HTMLInputElement, username: string) {
        playerAMeCheckbox?.addEventListener('change', () => {
            if (playerAMeCheckbox.checked) {
                if (playerBMeCheckbox.checked) {
                    playerBMeCheckbox.checked = false;
                    playerBInput.value = '';
                    playerBInput.readOnly = false;
                }
                playerAInput.value = username || '';
                playerAInput.readOnly = true;
            } else {
                playerAInput.readOnly = false;
                playerAInput.value = '';
            }
        });
        playerBMeCheckbox?.addEventListener('change', () => {
            if (playerBMeCheckbox.checked) {
                if (playerAMeCheckbox.checked) {
                    playerAMeCheckbox.checked = false;
                    playerAInput.value = '';
                    playerAInput.readOnly = false;
                }
                playerBInput.value = username || '';
                playerBInput.readOnly = true;
            } else {
                playerBInput.readOnly = false;
                playerBInput.value = '';
            }
        });
    }

    async open1v1GameForm(localGameDiv: HTMLElement, userData: UserData) {
        if (!localGameDiv)
            return;

        localGameDiv.innerHTML = `
            <form id="new-game-form">
                <div style="margin-bottom: 15px;">
                    <label for="player_a">Player A:</label>
                    <input type="text" id="player_a" name="player_a" placeholder="Enter player A name" required />
                    <label>
                        <input type="checkbox" id="player_a_me" name="player_a_me" />
                        Me
                    </label>
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="player_b">Player B:</label>
                    <input type="text" id="player_b" name="player_b" placeholder="Enter player B name" required />
                    <label style="margin-top: 5px; display: block;">
                        <input type="checkbox" id="player_b_me" name="player_b_me" style="margin-right: 5px;" />
                        Me
                    </label>
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" id="create-btn">Create Game</button>
                    <button type="button" id="cancel-btn" >Cancel</button>
                </div>
            </form>
        `;

        const playerAMeCheckbox = document.getElementById('player_a_me') as HTMLInputElement;
        const playerBMeCheckbox = document.getElementById('player_b_me') as HTMLInputElement;
        const playerAInput = document.getElementById('player_a') as HTMLInputElement;
        const playerBInput = document.getElementById('player_b') as HTMLInputElement;

        // Add functionality : only 1 checkbox is available
        this.meCheckBox1ChoiceOnly(playerAMeCheckbox, playerBMeCheckbox, playerAInput, playerBInput, userData.username);

        // Add the cancel button functionality
        document.getElementById('cancel-btn')?.addEventListener('click', () => {
            localGameDiv.innerHTML = '<button id="local-btn">🎮 Local Game</button>';
            document.getElementById('local-btn')?.addEventListener('click', async () => {
                await this.open1v1GameForm(localGameDiv, userData);
            });
        });

        // Add the form functionality
        const form = document.getElementById('new-game-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);

            const playerARaw = formData.get('player_a');
            const playerBRaw = formData.get('player_b');

            console.log('Raw values:', { playerARaw, playerBRaw });
            console.log('Types:', { typeA: typeof playerARaw, typeB: typeof playerBRaw });

            const playerA = (playerARaw as string)?.trim() || '';
            const playerB = (playerBRaw as string)?.trim() || '';

            console.log('After trim:', { playerA, playerB });
            console.log('Lengths:', { lengthA: playerA.length, lengthB: playerB.length });

            if (!playerA || !playerB) {
                alert('Please enter both player names');
                return;
            }
            if (playerA === playerB) {
                alert('Player names must be different');
                return;
            }

            try {
                // Create game with API
                const request = await createLocalGame(userData.id, playerA, playerB);
                if (!request.ok) {
                    throw new Error('Failed to create game');
                }
                // For now not using the returned data

            } catch (error) {
                console.error('Error creating game:', error);
                alert('Error creating game. Please try again.');
            }

            // Cancel render after success
            localGameDiv.innerHTML = '<button id="local-btn">🎮 New</button>';
            document.getElementById('local-btn')?.addEventListener('click', async () => {
                await this.open1v1GameForm(localGameDiv, userData);
            });

            // Refresh available games
            await this.refreshAvailableGames(userData);

            // Success message
            alert('Game created successfully!');
        });
    }

    async generate1v1GamePage() {
		console.log("generate 1v1 Game Page");

        const req = await getUserInfo();
        if (!req.ok)
        {
            console.log('Error GamePage: ', req.error);
            alert("Error GamePage" + req.error);
            return ;
        }
        const userData = req.userInfo;
    
        this.Page.innerHTML = `
            <h1></h1>
            <h1>1v1 game page</h1>
            <p>Welcome, <strong>${userData.username}</strong>!</p>
            
            <div class="game-settings">
                <h2>Create a new game</h2>
                <div id="new-game"><button id="new-btn">🎮 New</button></div>
                <h2>List of available games</h2>
                <div id="available-games"></div>
            </div>
        `;

        // Update content in available games
        await this.refreshAvailableGames(userData);

        // Add functionality : click on local-games open the form to say who plays
			const newGameDiv = document.getElementById('new-game');
        if (!newGameDiv) {
            console.log('availableGames debug');
            this.Page.innerHTML = `Error`;
            return;
        }
        document.getElementById('new-btn')?.addEventListener('click', async () => {
            await this.open1v1GameForm(newGameDiv, userData);
        });
    }

	async Manage1v1Event() {
		document.getElementById('1v1-btn')?.addEventListener('click', async () => {
			await this.generate1v1GamePage();
		});
	}

    async generateGamePage() {
        // Show game options
		console.log("generate Game Page");

        const req = await getUserInfo();
        if (!req.ok)
        {
            alert("Error GamePage constructor : " + req.error);
            return;
        }
        this.Page.innerHTML = `
            <h1></h1>
            <h1>Choose your game mode</h1>
            <p>Welcome, <strong>${req.userInfo.username}</strong>!</p>
            <div class="game-modes">
                <div id="1v1-game"><button id="1v1-btn">🎮 1v1 Game</button></div>
                <div id="tournament"></div><button id="tournament-btn" disabled>Tournament (coming soon)</button></div>
            </div>
        `

    }

	renderGamePage() {
		this._Body.appendChild(this.Page);
		document.body.appendChild(this._Overlay);
		this.Manage1v1Event();
	}

	get _Page(): HTMLElement {
		return this.Page;
	}
}
