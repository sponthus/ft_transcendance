import { createDiv, createElement, createButton, createImage, createInput, createCheckBoxLabel, append, setbackgroundImages, createAnchorElement} from '../../Utils/elementMaker.js';
import { availableGames } from './AvailableGames.js';
import { getTournamentMatches, GameInfos, getTournamentNextMatch, TournamentsInfos } from "../../api/game-service/tournaments/getTournaments.js" 
import { ErrorPopup } from '../ErrorPage.js';
import { getUserInfoBySlug } from '../../api/user-service/user-info/getUserInfo.js';

export class TournamentPage {
	private Page!: HTMLElement;
	// private NewTournamentForm!: HTMLElement;
	// private BracketDiv!: HTMLElement;
	// private FormMap!: Map<HTMLElement, HTMLInputElement>;
	private PartyMap!: Map<TournamentsInfos, HTMLButtonElement>;
	private AvailableGames: availableGames;
	private Tournament?: any;
	private TournamentId?: number;
	private NextGameId: number;
	private Username!: string;
	private TournamentMatches: Map<number, number>; // Map<gameId, idDiv>

	private Option: number = 1;
	/*************************button*************************/
	private PlayBtn!: HTMLButtonElement;
	private ContinueBtn!: HTMLButtonElement;
	private BackBtn!: HTMLButtonElement;

	private nameMap!: Map<number, HTMLInputElement>;
	private OptionBtn!: HTMLButtonElement;
	private OptionImg!: HTMLImageElement;
	private TournamentName!: HTMLInputElement;

	private isFinal: boolean;

	/*************************utils div*************************/
	private TournamentPan!: HTMLElement;

	constructor(Page: HTMLElement, UserName: string) {
		this.isFinal = false;
		this.Page = Page;
		this.nameMap = new Map<number, HTMLInputElement>();
		this.PartyMap = new Map<TournamentsInfos, HTMLButtonElement>();
		this.AvailableGames = new availableGames(this.PartyMap);
		this.Username = UserName;
		this.TournamentMatches = new Map<number, number>();
		this.NextGameId = 0; // Impossible value, game id never 0
	}

	/****************function for rendering tournament page****************/
	async render() {
		this.PlayBtn = (createButton("play", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[30%] w-[35%] aspect-square transition-transform duration-200 ease-out translate-x-96", "") as HTMLButtonElement);
		setbackgroundImages(this.PlayBtn, "url('/game_ui/Playebtn.png')");
		
		this.ContinueBtn = (createButton("continue", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[12%] w-[30%] transition-transform duration-200 ease-out -translate-x-96", "") as HTMLButtonElement);
		setbackgroundImages(this.ContinueBtn, "url('/game_ui/continueBtn.png')");

		this.BackBtn = (createButton("return", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[10%] w-[20%] transition-transform duration-200 ease-out top-16 left-32 -translate-x-96", "") as HTMLButtonElement);
		setbackgroundImages(this.BackBtn, "url('/game_ui/Backbtn.png')");
		
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-65", 'tournament-page.png')]);
		
		append(this.Page, [createImage('bot-text', 'z-10 object-center object-fill h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/tournamentText.png') // change to tournament pong text
							,this.ContinueBtn , this.PlayBtn , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(() => {
			this.PlayBtn.classList.remove('translate-x-96');
			this.ContinueBtn.classList.remove('-translate-x-96');
			this.BackBtn.classList.remove('-translate-x-96');
		}, 100);
	}

	/****************function for rendering new tournament page****************/
	async renderNewTournament() {
		const btnDiv = createDiv('btn', 'flex flex-row justify-around w-full h-[20%] z-5 transition-transform duration-200 ease-out -translate-x-96');
		this.InitTournamentForm(btnDiv);
		this.fillNewPan();
		this.appendTournamentForm(btnDiv);
	}

	/****************fill panel with create tournament form****************/
	private fillNewPan() {
		append(this.TournamentPan, [createImage('player-name', 'object-center h-[10%] w-[20%] transition-transform duration-200 ease-out translate-y-24 -translate-x-64', 'game_ui/setting/playerNamestext.png')	
									, this.addNameForm(), this.createTournamentNameForm() ,this.createcrabmehamehaDiv()]);
	}

	/****************adding player names input on panel****************/
	private addNameForm(): HTMLElement {
		const NameFormDiv: HTMLElement = createDiv('name-form', 'flex flex-col w-full h-[50%] items-center z-10 space-y-4 translate-x-10');
		for (let i = 0; i < 4; i++) {
			append(NameFormDiv, [this.createPlayerNameDiv(i)]);
		}
		return NameFormDiv
	}

	/****************create 1 name input****************/
	private createPlayerNameDiv(index: number): HTMLElement {
		const playerDiv: HTMLElement = createDiv('players-names', 'flex justify-start items-center h-[20%]');

		const containerInput: HTMLElement = createDiv(`container-input-${index + 1}`, 'flex flex-col items-center h-full w-[70%] translate-y-2')
		const PlayerInput: HTMLInputElement = createInput(['', `player-${index + 1}`, '', true], `player-${index + 1}`, 'h-[50%] w-full');
		if (index === 0){
			PlayerInput.value = this.Username;
			PlayerInput.readOnly = true;
		}
		else
			PlayerInput.value = `Player ${(index + 1).toString()}`;
		this.nameMap.set(index + 1, PlayerInput);
		const Div: HTMLElement = createDiv(`user-${index + 1}`, 'flex flex-col bg-white border-2 h-[50%] w-full overflow-y-scroll opacity-0 hidden')
		append(containerInput, [PlayerInput, Div]);

		const container: HTMLElement = createDiv('', 'grid  justify-start place-items-center w-full h-full');
		const playerPan: HTMLImageElement = createImage(`Player-${(index + 1).toString()}`, ' object-contain col-start-1 row-start-1', 'game_ui/setting/emptyPan.png');
		append(container, [createElement('p',`Player-${(index + 1).toString()}`, `Player ${(index + 1).toString()}`, 'z-10 text-center col-start-1 row-start-1 text-orange-200')
						,playerPan]);
	
		append(playerDiv, [container, containerInput]);

		return playerDiv;
	}

	/****************create tournament names input****************/
	private createTournamentNameForm() {
		const checcrabmehamehaDiv: HTMLElement = createDiv('crabmehameha', 'flex items-center justify-arround h-[10%] -translate-x-32 space-x-4');

		this.TournamentName = createInput(['text', 'tournament-name', 'tournament name', true], 'tournament-name', 'h-[70%] w-[70%]');
		// this.TournamentName.value = "tournament name";
	
		append(checcrabmehamehaDiv, [createElement('p', '', "name", 'text-center text-orange-200 text-4xl')
									,this.TournamentName]);

		return checcrabmehamehaDiv;
	}

	/****************create crabmehameha input****************/
	private createcrabmehamehaDiv() : HTMLElement {
		const checcrabmehamehaDiv: HTMLElement = createDiv('crabmehameha', 'flex items-center justify-arround h-[10%]  -translate-x-28 space-x-4');

		this.OptionBtn = createButton('minus', 'flex items-center active:scale-95 hover:scale-105 transition-all duration-200', '');
		let src: string = 'game_ui/setting/checkedValue.png';
		if (this.Option == 0)
			src = 'game_ui/setting/uncheckedValue.png';

		this.OptionImg = createImage('check', 'active:scale-95 hover:scale-105 transition-all duration-200', src);
		append(this.OptionBtn, [this.OptionImg]);
	
		append(checcrabmehamehaDiv, [createElement('p', '', "option crabmehameha", 'text-center text-orange-200 text-4xl')
									,this.OptionBtn]);

		return checcrabmehamehaDiv;
	}

	/****************function for rendering continue tournament page****************/
	async renderContinueTournament() {
		const btnDiv = createDiv('btn', 'flex flex-row justify-around w-full h-[20%] -translate-x-96 transition-transform duration-200 ease-out');
		this.InitTournamentForm(btnDiv);
		await this.fillContinuePan();
		this.appendTournamentForm(btnDiv);
	}

	/****************fill panel with available tournament****************/
	private async fillContinuePan() {
		this.AvailableGames.render(this.TournamentPan);
		await this.AvailableGames.refreshAvailableGames();
	}

	/****************creating backbtn and playbtn and tournament panel for new and continue tournament****************/
	private InitTournamentForm(btnDiv: HTMLElement) {
		this.BackBtn = (createButton("return", "relative flex items-center active:scale-95 hover:scale-105 h-full w-[20%] transition-all duration-200", "") as HTMLButtonElement);
		this.PlayBtn = (createButton("play", "relative flex items-center active:scale-95 hover:scale-105 h-full aspect-square transition-all duration-200", "") as HTMLButtonElement);
		append(this.PlayBtn, [createImage('Play', 'absolute object-center h-full w-full', 'game_ui/Playebtn.png')]);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		append(btnDiv, [this.BackBtn, this.PlayBtn]);

		this.TournamentPan = createDiv('tournament-pan', 'relative flex flex-col items-center w-full h-[85%] transition-transform duration-200 ease-out translate-x-96 space-y-4');
		setbackgroundImages(this.TournamentPan, "url('/game_ui/setting/SettingPan.png')");
	}

	/****************append element for new and continue tournament panel****************/
	private appendTournamentForm(btnDiv: HTMLElement) {
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-20", 'tournament-page.png')]);

		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/tournamentText.png') /**change to tournament title */
						, this.TournamentPan, btnDiv]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.TournamentPan.classList.remove('translate-x-96');
			btnDiv.classList.remove('-translate-x-96');
		}, 300);
	}

	async renderWaitingScreen(IdTournament: number) {
		this.Page.innerHTML = `<div class="flex flex-col h-[70%] w-full items-center justify-center space-y-16">
 											<div class="">
												<img class="mx-auto object-cover rounded-full object-center h-32 w-18 transition-all duration-200 transform animate-wiggle" src="/logo/logoIlsandWorld.png">
												</img>
												<h1 class="animate-typing  overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-5xl text-emerald-600 font-bold">
													waiting ...
												</h1>
											</div>
											<div>
												<h2 class="animate-bounce text-emerald-600 font-bold text-2xl h-hull w-full">
													Waiting for all users to be ready ready
												</h2>
											</div>
										</div>`;
	
		this.BackBtn = (createButton("return", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[10%] w-[20%] transition-transform duration-200 ease-out left-32 -translate-x-96", "") as HTMLButtonElement);
		setbackgroundImages(this.BackBtn, "url('/game_ui/Backbtn.png')");
		append(this.Page, [this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.BackBtn.classList.remove('-translate-x-96');
		}, 300);
	}

	async renderBracket(IdTournament: number) {
		this.TournamentId = IdTournament
		this.Page.classList.remove('opacity-0');
		this.TournamentId = IdTournament;
		const btnDiv = createDiv('btn', 'flex flex-row justify-around w-full h-[20%] z-5 -translate-x-96 transition-transform duration-200 ease-out');
		this.InitTournamentForm(btnDiv);
		await this.fillTournamentMatch();
		this.appendTournamentForm(btnDiv);

	}

	private async fillTournamentMatch() {
		/*******function for rendering bracket tournament**********/
		try {
			const data = await getTournamentMatches(this.TournamentId!);
			if (!data.ok)
				throw new Error("Unable to get tournament matches");
				console.log("tournament bracket rendering");
				this.TournamentMatches.clear(); // On vide avant de remplir

				// Assign key = gameId, value = element in div
				data.matches.forEach((match, index) => {
					this.TournamentMatches.set(match.id, index + 1);
				});
				console.log(this.TournamentMatches);
			/***********************function to render bracket tournament *************************/
			this.TournamentPan.className = 'relative flex justify-center items-center w-full h-[80%] transition-all duration-200 translate-x-96 gap-12';
			// this.TournamentPan = createDiv("bracket", "flex justify-between items-center h-full w-full space-x-4") as HTMLElement;
			
			const numberOfMatches = data.matches.length;
			if (numberOfMatches == 3) // 4 players tournament
			{
				this.createRound2(1, data.matches[0]);
				this.createFinal(3, data.matches[2]);
				this.createRound2(2, data.matches[1]);
			} 
			append(this.Page, [this.TournamentPan]);
			this.findNextRound();
		} catch (error) {
			await ErrorPopup(error as string);
			this.Page.innerHTML = `<div class="text-red-500">error : ${error}</div>`
		}
	}

	// Create 2 matches in 1 vertical div
	private createRound1(Matchs: number[], data: GameInfos[]) {
		const Round1Div = createDiv("round1", "flex flex-col justify-around h-full w-[20%] space-y-4");
		for (let i = 0; i < 2; i++) 
			append(Round1Div, [(this.createMatch(Matchs[i], "flex flex-col items-center justify-around h-[50%] w-full rounded-full space-y-4", data[i], true) as HTMLElement)]);

		append(this.TournamentPan, [Round1Div]);
	}
	
	// Create div match for round
	private createRound2(Match: number, data: GameInfos) {
		const Round2Div = createDiv("round2", "flex flex-col justify-around h-full w-[20%] space-y-4");
		append(Round2Div, [(this.createMatch(Match, "flex flex-col items-center justify-around h-[75%] w-full space-y-4", data, false) as HTMLElement)]);
		append(this.TournamentPan, [Round2Div]);
	}

	// Create the final match 
	private createFinal(Match: number, data: GameInfos) {
		const Round2Div = createDiv("round2", "flex flex-col justify-around h-full w-[20%] space-y-4");
		append(Round2Div, [(this.createMatch(Match, "flex flex-col items-center justify-around h-[50%] w-full rounded-full space-y-4", data, true) as HTMLElement)]);
		append(this.TournamentPan, [Round2Div]);
	}

	private createMatch(Match: number, ClassName :string, data: GameInfos, final: boolean): HTMLElement {
		const MatchDiv =  createDiv(`match-${Match}`, ClassName) as HTMLElement;
		const MatchRound = data.round + 1;
		const MatchNumber = data.match + 1;

		let TabPlayer: [Player1: string, Player2: string] = ["Winner", "Winner"];
		if (data.player_a != "undefined")
			TabPlayer[0] = data.player_a;
		if (data.player_b != "undefined")
			TabPlayer[1] = data.player_b;
		
		for (let i = 0; i < 2; i++) {
			const PlayerDiv = createDiv(`player-${i + i}`, "border rounded-xl w-[50%] text-center") as HTMLElement;
			setbackgroundImages(PlayerDiv,"url('/game_ui/setting/emptyPan.png')");
			if (TabPlayer[i][0] == '@')
				this.appendPlayerNameDiv(PlayerDiv, TabPlayer[i].substring(1, TabPlayer[i].length));
			else
				append(PlayerDiv, [createElement('p', `player-${i + i}`, TabPlayer[i],  "text-orange-200") as HTMLElement]);
			append(MatchDiv, [PlayerDiv]);
			if (i == 0) {
				if (final) {
					append(MatchDiv, [createElement('p', `match-${Match}`, `Final`, "text-orange-200 font-bold")]);
				} else {
					append(MatchDiv, [createElement('p', `match-${Match}`, `Round ${MatchRound}`, "text-orange-200 font-bold")]);
				}
			}
		}
		return MatchDiv;
	}

	private async appendPlayerNameDiv(parent: HTMLElement, slug: string){
		console.log('slug : ', slug);
		try {
			const req = await getUserInfoBySlug(slug);
			if (req.ok) {
				append(parent, [createAnchorElement(`${slug}`, req.userInfo.username, `/user/${slug}`, "text-orange-200") as HTMLElement]);
			}
		}catch(error) {
			await ErrorPopup(error as string);
		}

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
			console.log("next round = ", data.next_match); 
			if (data.next_match.round == 1)
				this.isFinal = true;
			if (!this.TournamentMatches.has(this.NextGameId))
				throw new Error("Next tournament id not found in matches");
			NextRound = this.TournamentMatches.get(this.NextGameId)!;
		} catch (error) {
			await ErrorPopup(error as string);
		}
		(document.getElementById(`match-${NextRound}-div`) as HTMLElement)?.classList.add('animate-wiggle');
	}


	get _PartyMap(): Map<TournamentsInfos, HTMLButtonElement>{
		return this.PartyMap;
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
	
	get _playBtn() : HTMLButtonElement {
		return this.PlayBtn;
	}

	get _continueBtn(): HTMLButtonElement {
		return this.ContinueBtn;
	}

	get _backBtn(): HTMLButtonElement {
		return this.BackBtn;
	}

	get _nameMap(): Map<number, HTMLInputElement> {
		return this.nameMap;
	}

	get _option(): number{
		return this.Option;
	}

	get _optionbtn():HTMLButtonElement {
		return this.OptionBtn;
	}

	get _optionimg(): HTMLImageElement {
		return this.OptionImg;
	}

	get _tournamentName(): HTMLInputElement {
		return this.TournamentName;
	}

	get _tournamentId(): number | null{
		if (this.TournamentId)
			return this.TournamentId;
		return null;
	}

	get _isFinal(): boolean {
		return this.isFinal;
	}

	set setOption(Option: number){
		this.Option = Option;
	}
}