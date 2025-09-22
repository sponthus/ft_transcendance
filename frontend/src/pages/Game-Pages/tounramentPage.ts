import { Checkbox } from '@babylonjs/inspector/fluent/primitives/checkbox';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { availableGames } from './AvailableGames.js';
import { getTournamentMatches, GameInfos, getTournamentNextMatch } from "../../api/game-service/tournaments/getTournaments.js" 
import { Game } from '../../babylon/main.js';

/**
 * in event.ts you can find the class wich add tournament in the backend (saveTournament() call by SaveNewParty()) and launch round (function PlayRound()) 
 * in AvailableGames.ts you can find the class wich display available games you'll have to modify refreshAvailableTournament() in it to get available tournament
 * after setting Tournament (create tournament and set available games) you will have to decomment the PlayTournament() function in Event.ts and delete the line this.GamePage.generateBracketTournament(0); (or comment)
 *  
 */
export class TournamentPage {
	private Page!: HTMLElement;
	private NewTournamentForm!: HTMLElement;
	private BracketDiv!: HTMLElement;
	private FormMap!: Map<HTMLElement, HTMLInputElement>;
	private PartyMap!: Map<number, HTMLInputElement>;
	private AvailableGames: availableGames;
	private Tournament?: any;
	private TournamentId?: number;
	private NextGameId: number;
	private Username!: string;
	private TournamentMatches: Map<number, number>; // Map<gameId, idDiv>


	constructor(Page: HTMLElement, UserName: string) {
		this.Page = Page;
		this.FormMap = new Map<HTMLElement, HTMLInputElement>();
		this.PartyMap = new Map<number, HTMLInputElement>();
		this.AvailableGames = new availableGames(this.Page, this.PartyMap);
		this.Username = UserName;
		this.TournamentMatches = new Map<number, number>();
		this.NextGameId = 0; // Impossible value, game id never 0
	}

	async render() {
		this.Page.classList.remove("border-4");
		this.Page.classList.remove("justify-center");
		await this.createTournamentPageDiv();
		await this.createTournamentFormDiv();
		this.AvailableGames.render();
		this.openTournamentForm();
		this.refreshAvailableTournament();
	}

	async renderBracket(IdTournament: number) {
		this.TournamentId = IdTournament;
		/*******function for rendering bracket tournament**********/
		try {
			const data = await getTournamentMatches(IdTournament);
			if (!data.ok)
				throw new Error("Unable to get tournament matches");

				this.TournamentMatches.clear(); // On vide avant de remplir

				// Assign key = gameId, value = element in div
				data.matches.forEach((match, index) => {
					this.TournamentMatches.set(match.id, index + 1);
				});
				console.log(this.TournamentMatches);
			/***********************function to render bracket tournament *************************/
			this.BracketDiv = createDiv("bracket", "flex justify-between items-center h-full w-full space-x-4") as HTMLElement;
			
			const numberOfMatches = data.matches.length;
			// TODO = Add 6-players tournament disposition ?
			if (numberOfMatches == 3) // 4 players tournament
			{
				// Give 1 element from the list of matches results as a parameter
				// Render from left to right
				this.createRound2(1, data.matches[0]);
				this.createFinal(3, data.matches[2]);
				this.createRound2(2, data.matches[1]);
			} else if (numberOfMatches == 7) // 8-players tournament
			{
				this.createRound1([1, 2], [data.matches[0], data.matches[1]]);/** match 1**//** round 2**/
				this.createRound2(5, data.matches[4]/** match 5**/);
				this.createFinal(7, data.matches[6]/** match 7**/);
				this.createRound2(4, data.matches[5]/** match 6**/);
				this.createRound1([3, 4], [data.matches[2], data.matches[3]]);/** match 3**//** match 4**/
			}
			append(this.Page, [this.BracketDiv]);
			this.findNextRound();
		} catch (error) {
			this.Page.innerHTML = `<div class="text-red-500">error : ${error}</div>`
		}
	}

	// Create 2 matches in 1 vertical div
	private createRound1(Matchs: number[], data: GameInfos[]) {
		const Round1Div = createDiv("round1", "flex flex-col justify-around h-full w-[20%] space-y-4");
		for (let i = 0; i < 2; i++) 
			append(Round1Div, [(this.createMatch(Matchs[i], "flex flex-col items-center justify-around h-[50%] w-full bg-orange-400 rounded-full space-y-4", data[i], true) as HTMLElement)]);

		append(this.BracketDiv, [Round1Div]);
	}
	
	// Create div match for round
	private createRound2(Match: number, data: GameInfos) {
		const Round2Div = createDiv("round2", "flex flex-col justify-around h-full w-[20%] space-y-4");
		append(Round2Div, [(this.createMatch(Match, "flex flex-col items-center justify-around h-[75%] w-full bg-orange-400 rounded-full space-y-4", data, false) as HTMLElement)]);
		append(this.BracketDiv, [Round2Div]);
	}

	// Create the final match 
	private createFinal(Match: number, data: GameInfos) {
		const Round2Div = createDiv("round2", "flex flex-col justify-around h-full w-[20%] space-y-4");
		append(Round2Div, [(this.createMatch(Match, "flex flex-col items-center justify-around h-[50%] w-full bg-orange-400 rounded-full space-y-4", data, true) as HTMLElement)]);
		append(this.BracketDiv, [Round2Div]);
	}

	private createMatch(Match: number, ClassName :string, data: GameInfos, final: boolean): HTMLElement {
		const MatchDiv =  createDiv(`match-${Match}`, ClassName) as HTMLElement;
		const MatchRound = data.round + 1;
		const MatchNumber = data.match + 1;

		const TabPlayer: [Player1: string, Player2: string] = [data.player_a/**replace by player A Name or "Winner" if there is no player name***/, data.player_b/**replace by player B Name or "Winner" if there is no player name***/];
		
		for (let i = 0; i < 2; i++) {
			const PlayerDiv = createDiv(`player-${i + i}`, "border rounded-xl w-[50%] text-center") as HTMLElement;
			append(PlayerDiv, [createElement('p', `player-${i + i}`, TabPlayer[i],  "text-emerald-600") as HTMLElement]);
			append(MatchDiv, [PlayerDiv]);
			if (i == 0) {
				if (final) {
					append(MatchDiv, [createElement('p', `match-${Match}`, `Final`, "text-emerald-600 font-bold")]);
				} else {
					append(MatchDiv, [createElement('p', `match-${Match}`, `Round ${MatchRound}`, "text-emerald-600 font-bold")]);
				}
			}
		}
		return MatchDiv
	}

	// Identifies next game to play in a tournament
	private async findNextRound() {
		let NextRound: number = 0;
		try {
			if (!this.TournamentId)
				throw new Error("No tournament ID defined in class"); // Debug, to remove ?
			const data = await getTournamentNextMatch(this.TournamentId);
			if (!data.ok)
				throw new Error("Error getting next match: " + data.error);
			this.NextGameId = data.next_match.game_id;
			if (!this.TournamentMatches.has(this.NextGameId))
				throw new Error("Next tournament id not found in matches");
			NextRound = this.TournamentMatches.get(this.NextGameId)!;
		} catch (error) {
			alert(error);
		}
		(document.getElementById(`match-${NextRound}-div`) as HTMLElement)?.classList.add('bg-orange-500');
	}

	private async createTournamentPageDiv() {
		const Div : HTMLElement = createDiv("New", "flex flex-col items-center justify-center");
			
		this.createNewTournamentText(Div);
		this.createNewTournamentBtn(Div);
		append(this.Page, [Div]);
	}
	
	// Title
	private createNewTournamentText(Div: HTMLElement) {
		const TextDiv: HTMLElement =  createDiv("TournamentPage-title", "flex items-center justify-center");
		const TournamentModText: HTMLElement = createElement('h1', "TournamentPage-title", "Create New Tournament",  "text-emerald-600 text-center underline");
		append(TextDiv, [TournamentModText]);
	
		if (Div)
			append(Div, [TextDiv]);
	}
	
	// "New "button
	private createNewTournamentBtn(Div: HTMLElement) {
		const BtnDiv: HTMLElement = createDiv("New", "flex items-center justify-center text-center p-4 bg-transparent py-3 px-4 w-full space-x-24");
	
		const ClassNameBtn: string = "bg-orange-200 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform w-full";
		const NewBtn: HTMLButtonElement = createButton("New", ClassNameBtn, "New");
	
		append(BtnDiv, [NewBtn]);
		if (Div)
			append(Div, [BtnDiv]);
	}

	private async createTournamentFormDiv() {
		this.NewTournamentForm = createDiv("Form", "flex flex-col items-center justify-center w-full space-y-6 hidden");
		append(this.Page, [this.NewTournamentForm]);
		this.renderTournamentFormDiv();
	}

	// Form content to create a tournament
	private async renderTournamentFormDiv() {
		const FormsDiv: HTMLFormElement = this.createNewTournamentFormDiv();
		this.addPlayersNameForm(FormsDiv, "Player1", "player_a_me", "Player 1 Name");
		this.addPlayersNameForm(FormsDiv, "Player2", "player_b_me", "Player 2 Name");
		this.addPlayersNameForm(FormsDiv, "Player3", "player_c_me", "Player 3 Name");
		this.addPlayersNameForm(FormsDiv, "Player4", "player_d_me", "Player 4 Name");
	}

	// form element for 1 player and his checkbox 
	private addPlayersNameForm(Div: HTMLElement, IdForm: string, idCheckBox: string, TextContent: string) {
		const Player: HTMLElement = createFormDiv(["text", IdForm, TextContent , true]
										,IdForm
										,""
										,["flex items-center flex-row-reverse space-x-4"
											,"block text-sm font-medium text-emerald-600 mb-2"
											,"w-full border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800focus:border-emerald-8 00 transition-colors duration-200 placeholder-emerald-600 text-center"
											,"block text-sm text-center font-medium text-emerald-500 mb-2"]);
	
		const checkbox = createCheckBoxLabel(idCheckBox, idCheckBox, "me", ["text-emerald-600",""]) as HTMLLabelElement;
		this.FormMap.set(Player, (checkbox.querySelector('input')) as HTMLInputElement);
		append(Player, [checkbox]);
		append(Div, [Player]);
	}

	// Form for tournament name
	private createNewTournamentFormDiv() : HTMLFormElement {
		const FormsDiv: HTMLFormElement = document.createElement('form');
		FormsDiv.id = "new-tournament-form";
		FormsDiv.className =  "grid grid-cols-4 grid-rows-2 gap-4  flex items-center justify-center w-full";
		append(this.NewTournamentForm, [(createFormDiv(["text", "name-tournament", "name of tournament" , true]
										,"name-tournament"
										,""
										,["flex items-center flex-row-reverse space-x-4"
											,"block text-sm font-medium text-emerald-600 mb-2"
											,"w-full border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800focus:border-emerald-8 00 transition-colors duration-200 placeholder-emerald-600 text-center"
											,"block text-sm text-center font-medium text-emerald-500 mb-2"]) as HTMLElement ),FormsDiv]);

		return FormsDiv;
	}

	// check for me checkboc function
	private openTournamentForm() {
		this.FormMap.forEach((value: HTMLInputElement, key: HTMLElement) => {
			value.addEventListener('change', () => {
				this.FormMap.forEach((value: HTMLInputElement, key: HTMLElement) => {
					const InputKey = key.querySelector("input") as HTMLInputElement;
					value.checked = false;
					InputKey.readOnly = false;
					InputKey.value = "";
				})
				const InputKey = key.querySelector("input") as HTMLInputElement;
				value.checked = true;
				InputKey.readOnly = true;
				InputKey.value = this.Username; // call qpi for username
			})
		}) 
	}

	// function to call refresh tournament
	async refreshAvailableTournament() {
		this.AvailableGames.refreshAvailableTournament();
	}

	get _NewTournamentForm() : HTMLElement {
		return this.NewTournamentForm;
	}

	get _PartyMap(): Map<number, HTMLInputElement>{
		return this.PartyMap;
	}

	get _FormMap() : Map<HTMLElement, HTMLInputElement> {
		return this.FormMap;
	}

	get _Tournament(): any {
		if (this.Tournament)
			return this.Tournament;
		else
			return null;
	}

	get _NextGameId(): number {
		return this.NextGameId;
	}
}