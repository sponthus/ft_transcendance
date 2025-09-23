import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';
// import { createLocalGame, getAvailableGames, startGame, deleteGame } from "../../api/game.js"
import { renderDropdown } from "./GamePage.js";
import { availableGames } from "./AvailableGames.js";


export class LocalGamePage {

	private Page!: HTMLElement;
	// private NewGameForm!: HTMLElement;
	private PartyMap!: Map<number, HTMLInputElement>;
	// private AvailableGames: availableGames;
	private Username!: string;
	private PlayerA!: string;
	private PlayerB: string = "Crabby the bot";
	private Ai: number = 0;
	private MaxScore: number = 5;
	private Option: number = 0;


	constructor(Page: HTMLElement, UserName: string) {
		this.Page = Page;
		this.PartyMap = new Map<number, HTMLInputElement>();
		// this.AvailableGames = new availableGames(this.Page, this.PartyMap);
		this.Username = UserName;
		this.PlayerA = this.Username;
	}

	async render() {
		this.Page.classList.add("relative");
		append(this.Page, [createImage("1v1", "absolute object-center h-full w-full opacity-80", '1v1-page.png')]);

		append(this.Page, [(createButton("play", "z-10 bg-orange-300 p-4 hover:bg-orange-400 text-emerald-600 hover:font-bold", "Play") as HTMLButtonElement)
							,(createButton("settings", "z-10 bg-orange-300 p-4 hover:bg-orange-400 text-emerald-600 hover:font-bold", "Settings") as HTMLButtonElement)
							,(createButton("return", "z-10 bg-orange-300 p-4 hover:bg-orange-400 text-emerald-600 hover:font-bold", "Return") as HTMLButtonElement)])
		// this.Page.classList.remove("justify-center");
		// this.Page.classList.remove("border-4");
		// await this.create1v1PageDiv();
		// await this.create1v1FormDiv();
		// this.AvailableGames.render();
		// this.open1v1GameForm();
		// await this.refreshAvailableGames();
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
