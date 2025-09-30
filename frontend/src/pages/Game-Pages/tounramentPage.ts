import { Checkbox } from '@babylonjs/inspector/fluent/primitives/checkbox';
import { createDiv, createElement, createButton, createImage, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { availableGames } from './AvailableGames.js';
import { getTournamentMatches, GameInfos, getTournamentNextMatch } from "../../api/game-service/tournaments/getTournaments.js" 
import { Game } from '../../babylon/main.js';


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

	/*************************button*************************/
	private PlayBtn!: HTMLButtonElement;
	private ContinueBtn!: HTMLButtonElement;
	private BackBtn!: HTMLButtonElement;


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
		this.Page.classList.add("relative");

		this.PlayBtn = (createButton("play", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[30%] aspect-square transition-all duration-200 translate-x-96", "") as HTMLButtonElement);
		this.ContinueBtn = (createButton("continue", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[12%] w-[30%] transition-all duration-200 -translate-x-96", "continue") as HTMLButtonElement);
		this.BackBtn = (createButton("return", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[10%] w-[20%] transition-all duration-200 top-16 left-32 -translate-x-96", "") as HTMLButtonElement);
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-65", '1v1-page.png')]);

		append(this.PlayBtn, [createImage('Play', 'absolute object-center h-full w-full', 'game_ui/Playebtn.png')]);
		append(this.ContinueBtn, [createImage('continue', 'absolute object-center h-full w-full', 'game_ui/continuesbtn.png')]);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/LocalPongText.png') // change to tournament pong text
							,this.ContinueBtn , this.PlayBtn , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(() => {
			this.PlayBtn.classList.remove('translate-x-96');
			this.ContinueBtn.classList.remove('-translate-x-96');
			this.BackBtn.classList.remove('-translate-x-96');
		}, 100);
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
	
	get _playbtn() : HTMLButtonElement {
		return this.PlayBtn;
	}

	get _continuebtn(): HTMLButtonElement {
		return this.ContinueBtn;
	}

	get _backbtn(): HTMLButtonElement {
		return this.BackBtn;
	}
}