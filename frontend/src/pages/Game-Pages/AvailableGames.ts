
import { State } from "../../core/state.js";
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { createLocalGame, getAvailableGames, startGame, deleteGame } from "../../api/game.js"

const state = State.getInstance();

export class availableGames {
	private Page: HTMLElement;
	private PartyMap: Map<number, HTMLInputElement>;

	constructor(page: HTMLElement,  PartyMap: Map<number, HTMLInputElement>) {
		this.Page = page;
		this.PartyMap = PartyMap;
	}

	render () {
		this.createAvailableGame();
	}

	private async createAvailableGame() {
		const AvailableDiv: HTMLElement = createDiv("available-games", "flex flex-col items-center w-[90%] h-[90%] space-y-8  mb-auto");

		append(AvailableDiv, [(createElement('p', "Title-Party", "", "text-center text-emerald-600 w-[50%] font-bold border-4 rounded-xl translate-y-4 border-orange-400 shadow-xl") as HTMLElement)
							, (createDiv("Body-Party", "flex flex-col w-[90%] h-64 border-4 border-orange-400 rounded-xl -translate-y-2shadow-xl overflow-auto") as HTMLElement)]);
		append(this.Page, [AvailableDiv]);
	}

	async refreshAvailableGames() {
		this.PartyMap!.clear();
		const BodyParty = document.getElementById("Body-Party-div")  as HTMLElement;
		BodyParty.innerHTML = '';

		const availableGamesDiv = document.getElementById('available-games-div');
		if (!availableGamesDiv || !state.user?.id) {
			console.log('availableGames debug');
			if(!availableGamesDiv)
			   this.Page.innerHTML = `Error don't find availables games`;
			return;
		}

		try {
			const result = await getAvailableGames(state.user?.id);
			if (!result.ok) {
				availableGamesDiv.innerHTML = 'Error loading games.';
				return;
			}
			const games = result.games;
			const TitlePartys = document.getElementById('Title-Party-p') as HTMLElement;
			this.renderParty(games, BodyParty, TitlePartys, false);
		}
		catch (error) {
			console.error('Error fetching games:', error);
			availableGamesDiv.innerHTML = '<p>Error loading games</p>';
		}
	}

	async refreshAvailableTournament() {
		/*************************here to call API get Availables tounrament********************************/
		this.PartyMap!.clear();
		const BodyParty = document.getElementById("Body-Party-div")  as HTMLElement;
		BodyParty.innerHTML = '';
	
		const availableGamesDiv = document.getElementById('available-games-div');
		if (!availableGamesDiv || !state.user?.id) {
			console.log('availableGames debug');
			if(!availableGamesDiv)
			   this.Page.innerHTML = `Error don't find availables games`;
			return;
		}
	
		try {
			const result = await getAvailableGames(state.user?.id); // change for Available Tournament
			if (!result.ok) {
				availableGamesDiv.innerHTML = 'Error loading games.';
				return;
			}
			const games = result.games;
			const TitlePartys = document.getElementById('Title-Party-p') as HTMLElement;
			this.renderParty(games, BodyParty, TitlePartys, true);
		}
		catch (error) {
			console.error('Error fetching games:', error);
			availableGamesDiv.innerHTML = '<p>Error loading games</p>';
		}
	}

	private renderParty(games: any, Parent: HTMLElement , TitlePartys: HTMLElement, tournament: boolean) {
			if (games.length === 0) {
				TitlePartys.textContent = 'No games available';
			}
			else {
				TitlePartys.textContent = 'available Partys';
				games.map((Party: any, index: number) => {
					const PartyDiv: HTMLElement = createDiv("game-item" + index.toString(), "flex border-2 border-orange-600 w-full h-[40%] space-x-8");

					this.CreateGameIdDiv(PartyDiv, index, Party);
					if (!tournament)
						this.CreatePlayerNamesDiv(PartyDiv, index, Party);
					this.createGameStatusDiv(PartyDiv, index, Party);
					this.createCreatedAtDiv(PartyDiv, index, Party);
					this.createCheckBoxDiv(PartyDiv, index, Party);
					append(Parent, [PartyDiv]);
				})
				this.ManagePartyEvent(tournament);
			}
	}

	private CreateGameIdDiv(Div: HTMLElement, index: number, Party: any) {
		const GameIdDivs = createDiv("party-item" + index.toString(), "w-[15%] h-full flex items-center") as HTMLElement;

		append(GameIdDivs, [(createElement('h2', "party-item " + index.toString(), `Game #${Party.id} :` , "text-emerald-600 text-center underline font-bold") as HTMLElement)]);
		append(Div, [GameIdDivs]);
	}

	private CreatePlayerNamesDiv(Div: HTMLElement, index: number, Party: any) {
		const PLayersNameDivs = createDiv("party-Players-Name" + index.toString(), "w-[20%] h-full grid grid-rows-4 items-center justify-center") as HTMLElement;

		append(PLayersNameDivs, [(createElement('h2', "party-Players-Name" + index.toString(), "Players : ", "text-emerald-600 text-center font-bold underline") as HTMLElement)
								, (createElement('h1', "party-Player-a-Name" + index.toString(), `${Party.player_a}`, "text-emerald-600 text-center") as HTMLElement)
								, (createElement('h1', "party-vs-Name" + index.toString(), `vs`, "text-emerald-600 text-center") as HTMLElement)
								, (createElement('h1', "party-Player-b-Name" + index.toString(), `${Party.player_b}`, "text-emerald-600 text-center") as HTMLElement)]);
		append(Div, [PLayersNameDivs]);
	}

	private createGameStatusDiv(Div: HTMLElement, index: number, Party: any) {
		const GamesStatueDivs = createDiv("party-statue" + index.toString(), "w-[20%] h-full grid grid-rows-4 items-center justify-center space-y-12") as HTMLElement;

		append(GamesStatueDivs, [(createElement('h2', "party-statue" + index.toString(), `Status : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
								, (createElement('h1', "party-statue" + index.toString(), `${Party.status}`, "text-emerald-600 text-center") as HTMLElement)]);
		append(Div, [GamesStatueDivs]);
	}

	private createCreatedAtDiv(Div: HTMLElement, index: number, Party: any) {
		const CreatedAtDivs = createDiv("party-item" + index.toString(), "w-[20%] h-full grid grid-rows-4 items-center justify-center space-y-12") as HTMLElement;
		
		append(CreatedAtDivs, [(createElement('h2', "party-statue" + index.toString(), `Created At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
								, (createElement('h1', "party-statue" + index.toString(), `${Party.created_at}`, "text-emerald-600 text-center") as HTMLElement)]);
		append(Div, [CreatedAtDivs]);
	}

	private createCheckBoxDiv(Div: HTMLElement, index: number, Party: any) {
		const checkboxDiv = createDiv("party-check", "w-[20%] h-full grid grid-rows-4 items-center justify-center space-y-12") as HTMLElement;
		const checkbox = createCheckBoxLabel(`$(Party.id)`, "choose", "", ["text-emerald-600 space-x-4",""]);
		this.PartyMap?.set(Party.id as number, (checkbox.querySelector('input')) as HTMLInputElement);

		append(checkboxDiv, [(createElement('h2', "choose", "choose one :", "text-emerald-600 font-bold underline") as HTMLElement)
							, checkbox]);
		append(Div, [checkboxDiv]);
	}

	private ManagePartyEvent(tournament: boolean) {
		this.PartyMap?.forEach((value, key) =>{
			value.addEventListener('change', () => {
				this.PartyMap?.forEach((value, key) => {
					value.checked = false; })
				value.checked = true;
			})
		})

		document.getElementById("delete-btn")?.addEventListener('click', async (e) => {
			this.PartyMap?.forEach(async (value, key) => {
				if (value.checked) {
					if (!tournament)
						await this.deleteGame(key);
					// else
						// await this.deleteTournament(key) // create funtion to delete tournament
					await this.refreshAvailableGames();
					return ;
				}
			})
		})
	}

	private async deleteGame(gameId: number) {
		try {
			const request = await deleteGame(gameId);
			if (!request.ok) {
				throw new Error('Unable to delete game : ' + request.error);
			}
			alert("Game deleted");
		} catch (error) {
			alert(error);
		}
		await this.refreshAvailableGames();
	}
}
