import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';
// import { createLocalGame, getAvailableGames, startGame, deleteGame } from "../../api/game.js"
// import { renderDropdown } from "./GamePage.js";
// import { availableGames } from "./AvailableGames.js";


export class LocalGamePage {

	private Page!: HTMLElement;
	// private NewGameForm!: HTMLElement;
	private PartyMap!: Map<number, HTMLInputElement>;
	// private AvailableGames: availableGames;
	private Username!: string;

	/*************************for creatingGame*************************/
	private PlayerA!: string;
	private PlayerB: string = "Crabby the bot";
	private Ai: number = 1; // ia playerA 2 PlayerB 
	private MaxScore: number = 5;
	private Option: number = 1;

	/*************************button*************************/
	private PlayBtn!: HTMLButtonElement;
	private SettingBtn!: HTMLButtonElement;
	private BackBtn!: HTMLButtonElement;

	private botBtn!: HTMLButtonElement;
	private playerBtn!: HTMLButtonElement;
	private plusbtn!: HTMLButtonElement;
	private minusBtn!: HTMLButtonElement;

	/*************************utils div*************************/
	private SettingPan!: HTMLElement;

	constructor(Page: HTMLElement, UserName: string) {
		// this.AvailableGames = new availableGames(this.Page, this.PartyMap);
		this.Page = Page;
		this.PartyMap = new Map<number, HTMLInputElement>();
		this.Username = UserName;
		this.PlayerA = "endoliam "; //this.Username; change to this.username
	}

	async render() {
		this.Page.classList.add("relative");

		this.PlayBtn = (createButton("play", "relative flex items-center z-5 hover:scale-105 h-[30%] aspect-square transition-all duration-200 translate-x-96", "") as HTMLButtonElement);
		this.SettingBtn = (createButton("settings", "relative flex items-center z-5 hover:scale-105 h-[12%] w-[30%] transition-all duration-200 -translate-x-96", "") as HTMLButtonElement);
		this.BackBtn = (createButton("return", "relative flex items-center z-5 hover:scale-105 h-[10%] w-[20%] transition-all duration-200 top-16 left-32 -translate-x-96", "") as HTMLButtonElement);
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-65", '1v1-page.png')]);

		append(this.PlayBtn, [createImage('Play', 'absolute object-center h-full w-full', 'game_ui/Playebtn.png')]);
		append(this.SettingBtn, [createImage('setting', 'absolute object-center h-full w-full', 'game_ui/Settingsbtn.png')]);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/LocalPongText.png')
							,this.SettingBtn , this.PlayBtn , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(() => {
			this.PlayBtn.classList.remove('translate-x-96'); // = "relative flex items-center z-5 hover:scale-105 h-[30%] aspect-square transition-all duration-300";
			this.SettingBtn.classList.remove('-translate-x-96');  //= "relative flex items-center z-5 hover:scale-105 h-[12%] w-[30%] transition-all duration-300";
			this.BackBtn.classList.remove('-translate-x-96');  //=  "relative flex items-center z-5 hover:scale-105 h-[10%] w-[20%] transition-all duration-300 top-16 left-32";
		}, 100);
		// this.Page.classList.remove("justify-center");
		// this.Page.classList.remove("border-4");
		// await this.create1v1PageDiv();
		// await this.create1v1FormDiv();
		// this.AvailableGames.render();
		// this.open1v1GameForm();
		// await this.refreshAvailableGames();
	}

	async renderSetting() {
		this.BackBtn = (createButton("return", "relative flex items-center z-5 hover:scale-105 h-[10%] w-[20%] transition-all duration-200 left-32 -translate-x-96", "") as HTMLButtonElement);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		this.SettingPan = createDiv('setting-pan', 'relative flex flex-col items-center w-full h-[70%] transition-all duration-200 translate-x-96 space-y-4');
		append(this.SettingPan ,[createImage('1v1-setting', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/SettingPan.png')]);		
		this.fillSetingPan();

		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-20", '1v1-page.png')]);
		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[7%] w-[50%] animate-wiggle margin-top-32', 'game_ui/setting/settingText.png')
							,this.SettingPan , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(async() => {
			this.SettingPan .classList.remove('translate-x-96');
			this.BackBtn.classList.remove('-translate-x-96');
		}, 100);
	}

	private fillSetingPan() {
		append(this.SettingPan, [this.createOpponentDiv(), this.createPlayerNameDiv()]);
	}

	private createOpponentDiv(): HTMLElement {
		const opponentDiv: HTMLElement = createDiv('opponent', 'relative flex items-center h-[13%] w-[70%] translate-y-16 space-x-8');

		this.botBtn = createButton('bot', 'relative flex items-center z-5 hover:scale-105 h-full w-[45%] transition-all duration-200', '');
		append(this.botBtn, [createImage('bot', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/botPan.png')]);

		this.playerBtn = createButton('player-setting', 'relative flex items-center z-5 hover:scale-105 h-full w-[45%] transition-all duration-200', '');
		append(this.playerBtn, [createImage('player', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/PlayerPan.png')]);

		append(opponentDiv, [this.botBtn, this.playerBtn]);
		return opponentDiv;
	}

	private createPlayerNameDiv(): HTMLElement {
		const PlayerNameDiv: HTMLElement = createDiv('player-name', 'flex flex-col h-[30%] w-[70%] translate-y-16 space-y-4');

		append(PlayerNameDiv, [createImage('player-name', 'z-5 object-center object-fill h-[30%] w-[40%]', 'game_ui/setting/playerNamestext.png')]);

		const playerADiv: HTMLElement = createDiv('player-name', 'relative flex h-[30%] w-full space-x-4');
		append(playerADiv, [createImage('playerA', 'z-5 object-center object-fill h-full w-[40%]', 'game_ui/setting/playerA.png'), createFormDiv(['', '', '', true], '', '', ['h-full w-[40%]','','', ''])]);

		const playerBDiv: HTMLElement = createDiv('player-name', 'relative flex h-[30%] w-full space-x-4');
		append(playerBDiv, [createImage('playerB', 'z-5 object-center object-fill h-full w-[40%]', 'game_ui/setting/playerB.png'), createFormDiv(['', '', '', true], '', '', ['h-full w-[40%]','','', ''])]);

		append(PlayerNameDiv, [playerADiv, playerBDiv]);
		return PlayerNameDiv;
	}

	private createScorelimitDiv(): HTMLElement {
		const scoreLimitDiv: HTMLElement = createDiv('score-limit', 'flex flex-col h-[30%]');
		return scoreLimitDiv;
	}
	/******************************************getter*************************************/
	get _PlayerA() :string{
		return this.PlayerA;
	}

	get _PlayerB(): string {
		return this.PlayerB;
	}

	get _Ai(): number {
		return this.Ai;
	}

	get _MaxScore(): number{
		return this.MaxScore;
	}

	get _option(): number{
		return this.Option;
	}

	get	_playBtn(): HTMLButtonElement {
		return this.PlayBtn;
	}

	get _settingBtn(): HTMLButtonElement {
		return this.SettingBtn;
	}

	get _backBtn(): HTMLButtonElement {
		return this.BackBtn;
	}

	get _settingPan(): HTMLElement {
		return this.SettingPan;
	}
	/******************************************getter*************************************/
	set setPlayerA(PlayerA: string){
		this.PlayerA = PlayerA;
	}

	set setPlayerB(PlayerB: string) {
		this.PlayerB = PlayerB;
	}

	set setAi(Ai: number) {
		this.Ai = Ai;
	}

	set setMaxScore(MaxScore: number){
		this.MaxScore = MaxScore;
	}

	set setOption(Option: number){
		this.Option = Option;
	}

// 	private async create1v1PageDiv() {
// 		const Div : HTMLElement = createDiv("New", "flex flex-col items-center justify-center");
		
// 		this.createNewGameText(Div);
// 		this.createNewGameBtn(Div);
// 		append(this.Page, [Div]);
// 	}

// 	private createNewGameText(Div: HTMLElement) {
// 		const TextDiv: HTMLElement =  createDiv("1v1Page-title", "flex items-center justify-center");
// 		const GameModText: HTMLElement = createElement('h1', "1v1Page-title", "Create New Game",  "text-emerald-600 text-center underline");
// 		append(TextDiv, [GameModText]);

// 		if (Div)
// 			append(Div, [TextDiv]);
// 	}

// 	private createNewGameBtn(Div: HTMLElement) {
// 		const BtnDiv: HTMLElement = createDiv("New", "flex items-center justify-center text-center p-4 bg-transparent py-3 px-4 w-full space-x-24");

// 		const ClassNameBtn: string = "bg-orange-200 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform w-full";
// 		const NewBtn: HTMLButtonElement = createButton("New", ClassNameBtn, "New");

// 		append(BtnDiv, [NewBtn]);
// 		if (Div)
// 			append(Div, [BtnDiv]);
// 	}

// 	private async create1v1FormDiv() {
// 		this.NewGameForm = createDiv("Form", "flex flex-col items-center justify-center w-full space-y-6 hidden");
// 		append(this.Page, [this.NewGameForm]);
// 		this.render1v1FormDiv();
// 	}

// 	private async render1v1FormDiv() {
// 		this.renderNewGameFormDropDown();

// 		const FormsDiv: HTMLFormElement = this.createNewGameFormDiv();
// 		this.addPlayersNameForm(FormsDiv, "Player1", "player_a_me", "Player 1 Name");
// 		this.addPlayersNameForm(FormsDiv, "Player2", "player_b_me", "Player 2 Name");
// 	}

// 	private createNewGameFormDiv() : HTMLFormElement {
// 		const FormsDiv: HTMLFormElement = document.createElement('form');
// 		FormsDiv.id = "new-game-form";
// 		FormsDiv.className =  "flex items-center justify-center w-full";
// 		append(this.NewGameForm, [FormsDiv]);

// 		return FormsDiv
// 	}

// 	private renderNewGameFormDropDown() {
// 		renderDropdown(this.NewGameForm ,["1 player vs AI", "Local Multiplayer"], "PlayerMod", "Pong player Mod :");
// 		renderDropdown(this.NewGameForm ,["5", "10", "15", "20", "No Limit"], "ScoreLimit", "Score Limit");
// 	}

// 	private addPlayersNameForm(Div: HTMLElement, IdForm: string, idCheckBox: string, TextContent: string) {
// 		const Player: HTMLElement = createFormDiv(["text", IdForm, TextContent , true]
// 										,IdForm
// 										,""
// 										,["flex items-center flex-row-reverse space-x-4"
// 											,"block text-sm font-medium text-emerald-600 mb-2"
// 											,"w-full border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800focus:border-emerald-8 00 transition-colors duration-200 placeholder-emerald-600 text-center"
// 											,"block text-sm text-center font-medium text-emerald-500 mb-2"]);
	
// 		const checkbox = createCheckBoxLabel(idCheckBox, idCheckBox, "me", ["text-emerald-600",""]);
// 		append(Player, [checkbox]);
// 		append(Div, [Player]);
// 	}


// 						/*********************************create open games Form*********************************/
// 	private async open1v1GameForm() {
// 		const playerAMeCheckbox = document.getElementById('player_a_me-input') as HTMLInputElement;
// 		const playerBMeCheckbox = document.getElementById('player_b_me-input') as HTMLInputElement;
// 		const playerAInput = document.getElementById('Player1-input') as HTMLInputElement;
// 		const playerBInput = document.getElementById('Player2-input') as HTMLInputElement;

// 		this.meCheckBox1ChoiceOnly(playerAMeCheckbox, playerAInput, playerBMeCheckbox, playerBInput);
// 		this.meCheckBox1ChoiceOnly(playerBMeCheckbox, playerBInput, playerAMeCheckbox, playerAInput);
// 	}

// 	async refreshAvailableGames() {
// 		this.AvailableGames.refreshAvailableGames();
// 	}

// 	private meCheckBox1ChoiceOnly(MeCheckbox: HTMLInputElement
// 					,MePlayerInput: HTMLInputElement
// 					,ElseCheckBox: HTMLInputElement
// 					,ElsePlayerInput: HTMLInputElement) {
// 		const Select = document.getElementById("PlayerMod-DropDown-Select") as HTMLSelectElement;
// 		this.newPlayerCheckBoxEvent(MeCheckbox, MePlayerInput, ElseCheckBox, ElsePlayerInput, Select);
// 		this.newPlayerSelectEvent(MeCheckbox, ElseCheckBox, ElsePlayerInput, Select);
// 	}

// 	private newPlayerCheckBoxEvent(MeCheckbox: HTMLInputElement
// 					,MePlayerInput: HTMLInputElement
// 					,ElseCheckBox: HTMLInputElement
// 					,ElsePlayerInput: HTMLInputElement
// 					, Select: HTMLSelectElement) {
		
// 		MeCheckbox?.addEventListener('change', () => {
// 		if (MeCheckbox.checked) {
// 			this.ChangePlayerNameInput(ElseCheckBox, ElsePlayerInput, Select.value);
// 			MePlayerInput.value = this.Username!; // call API 

// 			MePlayerInput.readOnly = true;
// 		} 
// 		else {
// 			MePlayerInput.readOnly = false;
// 			MePlayerInput.value = '';
// 		}
// 		});
// 	}

// 	private newPlayerSelectEvent(MeCheckbox: HTMLInputElement
// 						,ElseCheckBox: HTMLInputElement
// 						,ElsePlayerInput: HTMLInputElement
// 						, Select: HTMLSelectElement) {

// 		if (!Select )
// 			alert('there is no Select')
// 		Select.addEventListener('change', () => {
// 			if (Select.value == "1 player vs AI") {
// 				if (MeCheckbox.checked) {
// 					ElsePlayerInput.value = "Crabby The Bot";
// 					ElsePlayerInput.readOnly = true;
// 					console.log("change player value to crabby the bot");
// 					console.log("Valeur réelle après 0.5s :", ElsePlayerInput.value);
// 				}
// 			}
// 			else {
// 				if (MeCheckbox.checked) {
// 					ElsePlayerInput.value = "";
// 					ElsePlayerInput.readOnly = false;
// 				}
// 			}
// 			console.log("Valeur réelle après 0.5s :", ElsePlayerInput.value);
// 		})
		
// 	}

// 	private ChangePlayerNameInput(ElseCheckBox: HTMLInputElement ,ElsePlayerInput: HTMLInputElement, SelectedValue: string) {
// 		ElseCheckBox.checked = false;
// 		console.log("selcted Value in checkbox: ", SelectedValue);
// 		if (SelectedValue == "1 player vs AI") {
// 			ElsePlayerInput.value = 'Crabby The Bot';
// 			ElsePlayerInput.readOnly = true;
// 		}
// 		else {
// 			console.log("bonjour");
// 			if (ElsePlayerInput.value)
// 				ElsePlayerInput.value = '';
// 			ElsePlayerInput.readOnly = false;
// 		}
// 	}

// 	get _PartyMap(): Map<number, HTMLInputElement>{
// 		return this.PartyMap;
// 	}

// 	get _NewGameForm(): HTMLElement {
// 		return this.NewGameForm;
// 	}
}
