import { createDiv, createButton, append} from '../../Utils/elementMaker.js';
import { createLocalGame, startGame } from "../../api/game-service/games/game.js"
import { LocalGamePage } from './LocalGamePage.js';
import { GamePage } from './GamePage.js';
import { navigate } from '../../core/router.js';
import { launchPong } from './LaunchPong.js';
import { TournamentPage } from './tounramentPage.js';
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";
import { createTournament } from "../../api/game-service/tournaments/newTournament.js";

export enum PageState {MOD = 0, TOURNAMENT = 1, PARTY = 2, SETTING = 3, BRACKET = 4, WIN = 5};

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
	id: number
	username: string;
	nickname: string;
	avatar: string;
	slug: string;
	created_at: string;
};

export class Event {


	private StatePage!: number;
	private LocalGamePage!: LocalGamePage;
	private TournamentPage!: TournamentPage;
	private GamePage: GamePage;
	private LaunchPong: launchPong;

	constructor(LocalGamePage: LocalGamePage, TournamentPage: TournamentPage, GamePage: GamePage) {
		this.StatePage = PageState.MOD;
		this.LocalGamePage = LocalGamePage;
		this.TournamentPage = TournamentPage;
		this.GamePage = GamePage;
		this.LaunchPong = new launchPong(this.GamePage._render, this.GamePage);
	}

	render() {
		this.createReturnDiv();
	}

	/*************************************Function for creating Return and Save button*************************************/
	private async createReturnDiv(): Promise<void> {
		const Div: HTMLElement = createDiv("Submit", "flex items-center justify-center text-center p-4 bg-transparent py-3 px-4 h-[20%] w-full space-x-24");

		const ClassNameBtn: string = "bg-orange-200 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform w-[20%]";
		const ReturnBtn: HTMLButtonElement = createButton("Return", ClassNameBtn, "Return");
		const DeleteBtn: HTMLButtonElement = createButton("delete",ClassNameBtn + " hidden", "Delete");
		// const SaveBtn: HTMLButtonElement = createButton("Save", ClassNameBtn, "Save");

		append(Div, [ReturnBtn, DeleteBtn]);
		append(this.GamePage.Title, [Div]);
	}

	/*************************************Function for Manage Event Return and Save button*************************************/
	async ManageEvent() {
		if (this.StatePage === PageState.MOD)
			this.manageGameModEvent();
		this.ManageReturnEvent();
	}

	/*************************************Function for Event Return button*************************************/
	private async ManageReturnEvent() {
		const ReturnButton = document.getElementById("Return-btn") as HTMLButtonElement;
		if (!ReturnButton)
			console.log("pas de bouton retour");
		ReturnButton.addEventListener('click', async(e) => {
			switch(this.StatePage) {
				case PageState.MOD:
					this.ReturnToLobby();
					break;
				case PageState.PARTY:
					this.returnToGameMod();
					break;
				case PageState.TOURNAMENT:
					this.returnToGameMod();
					break;
				// case PageState.NEWGAME:
				// 	this.CancelNewGame();
				// 	break;
				case PageState.BRACKET:
					this.returnToTournament();
					break;
				case PageState.WIN:
					this.ReturnToLobby();
					break;
				default: break;
			}
		})
	}

	/*********************************function utils for return*********************************/
	private ReturnToLobby(){
		this.StatePage = PageState.MOD;
		this.GamePage.cleanStubborn();
		this.LaunchPong.returnLobby();
	}

	private returnToGameMod() {
		this.StatePage = PageState.MOD;
		Array.from(this.GamePage._Page.children).forEach((child)=>{
			child.remove();
		})
		this.GamePage.generateGamePage();
	}

	private async returnTo1v1Game() {
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.classList.add('-translate-x-96');
		if (this.LocalGamePage._settingPan)
			this.LocalGamePage._settingPan.classList.add('translate-x-96');
		this.StatePage = PageState.PARTY;
		await this.GamePage.generate1v1GamePage();
	}

	private async returnToTournament() {
		this.StatePage = PageState.TOURNAMENT;
		await this.GamePage.generateTournamentPage();
	}

	/*************************************Functions for Game Mod Event*************************************/
	async manageGameModEvent() {
		console.log("manage newgame event function called");
		(document.getElementById('1v1-btn')?.addEventListener('click', async() => {
			this.StatePage = PageState.PARTY;
			await this.GamePage.generate1v1GamePage();
		}));
		(document.getElementById('tournament-btn')?.addEventListener('click', async() => {
			this.StatePage = PageState.TOURNAMENT;
			await this.GamePage.generateTournamentPage();
		}));
	}

	/*************************************Functions for 1v1 Event*************************************/
	async managePlaye1v1GameEvent() {
		if (this.LocalGamePage._playBtn){
			this.LocalGamePage._playBtn.addEventListener('click', async() => {this.saveParty();})};
		if (this.LocalGamePage._settingBtn)
			this.LocalGamePage._settingBtn.addEventListener('click', async() => {this.GoTo1v1setting()});
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.addEventListener('click', async() => {this.returnToGameMod();})
	}

	/*************************************Functions for 1v1 setting Event*************************************/
	private GoTo1v1setting() {
		this.StatePage = PageState.SETTING;
		this.GamePage.generate1v1SettingPage();
	}

	async manageSettingEvent() {
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.addEventListener('click', async() => {this.returnTo1v1Game();})
		if (this.LocalGamePage._botBtn)
			this.LocalGamePage._botBtn.addEventListener('click', async() => {this.ActiveBotBtn();})
		if (this.LocalGamePage._playerBtn)
			this.LocalGamePage._playerBtn.addEventListener('click', async() => {this.activePlayervsBtn();})
		if (this.LocalGamePage._optionbtn)
			this.LocalGamePage._optionbtn.addEventListener('click', async() => {this.ClickOptionEvent();})
		if (this.LocalGamePage._minusbtn)
			this.LocalGamePage._minusbtn.addEventListener('click', async() => {this.clickminusEvent();})
		if (this.LocalGamePage._plusbtn)
			this.LocalGamePage._plusbtn.addEventListener('click', async() => {this.clickPlusEvent();})
	}

	private ActiveBotBtn() {
		if (this.LocalGamePage._Ai == 0) {
			this.LocalGamePage._botBtn.classList.remove('hover:scale-110');
			this.LocalGamePage._botBtn.classList.add('scale-110');
			this.LocalGamePage._playerBtn.classList.add('hover:scale-110');
			this.LocalGamePage._playerBtn.classList.remove('scale-110');
			this.LocalGamePage.setPlayerAInput = "endoliam";
			this.LocalGamePage.setPlayerA = this.LocalGamePage._playerAInput.value;
			this.LocalGamePage.setPlayerAReadonly = true;
			this.LocalGamePage.setPlayerBInput = "Crabby the bot";
			this.LocalGamePage.setPlayerB = this.LocalGamePage._playerBinput.value;
			this.LocalGamePage.setPlayerBReadonly = true;
			this.LocalGamePage.setAi = 1;
		}
	}

	private activePlayervsBtn() {
		if (this.LocalGamePage._Ai > 0) {
			this.LocalGamePage._playerBtn.classList.remove('hover:scale-110');
			this.LocalGamePage._playerBtn.classList.add('scale-110');
			this.LocalGamePage._botBtn.classList.add('hover:scale-110');
			this.LocalGamePage._botBtn.classList.remove('scale-110');
			this.LocalGamePage.setPlayerAInput = "player A";
			this.LocalGamePage.setPlayerA = this.LocalGamePage._playerAInput.value;
			this.LocalGamePage.setPlayerAReadonly = false;
			this.LocalGamePage.setPlayerBInput = "player B";
			this.LocalGamePage.setPlayerB = this.LocalGamePage._playerBinput.value;
			this.LocalGamePage.setPlayerBReadonly = false;
			this.LocalGamePage.setAi = 0;
		}
	}

	private clickPlusEvent() {
		if (this.LocalGamePage._MaxScore < 15) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  + 5;
			console.log("maxscore : ", this.LocalGamePage._MaxScore );
		}
	}

	private clickminusEvent() {
		if (this.LocalGamePage._MaxScore > 5) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  - 5;
			console.log("maxscore : ", this.LocalGamePage._MaxScore );
		}
	}

	private ClickOptionEvent() {
		if (this.LocalGamePage._option == 1) {
			this.LocalGamePage._optionimg.src = 'game_ui/setting/uncheckedValue.png';
			this.LocalGamePage.setOption = 0;
		}
		else {
			this.LocalGamePage._optionimg.src = 'game_ui/setting/checkedValue.png';
			this.LocalGamePage.setOption = 1;
		}
	}

	/*************************************Functions for tournament Event*************************************/

	async manageTournamentEvent() {
		if (this.TournamentPage._backbtn)
			this.TournamentPage._backbtn.addEventListener('click', async() => {this.returnToGameMod();})
	}

	// private async ManageSaveEvent() {
	// 	 document.getElementById("Save-btn")?.addEventListener('click', async(e) => {
	// 			switch(this.StatePage) {
	// 			case PageState.MOD:
	// 				this.SaveGameMod();
	// 				break;
	// 			case PageState.PARTY:
	// 				this.PlayGame();
	// 				break;
	// 			case PageState.TOURNAMENT:
	// 				this.PlayTournament();
	// 				break;
	// 			case PageState.NEWGAME:
	// 				this.SaveNewParty();
	// 				break;
	// 			case PageState.BRACKET:
	// 				this.PlayRound();
	// 				break;
	// 			case PageState.WIN:
	// 				this.returnToGameMod();
	// 				break;
	// 			default: break;
	// 		}
	// 	})
	// }

				/*********************************function utils for saving games*********************************/
	// private async SaveGameMod() {
	// 	const SelectValue = this.FindSelectValue("GameMod-DropDown-div");
	// 	if (SelectValue == "1v1") {
	// 		this.StatePage = PageState.PARTY;
	// 		await this.GamePage.generate1v1GamePage();
	// 	}
	// 	else if (SelectValue == "tournament")
	// 	{
	// 		this.StatePage = PageState.TOURNAMENT;
	// 		await this.GamePage.generateTournamentPage();
	// 		// alert("tournament in build please choose 1v1 mode");
	// 	}
	// 	else if (!SelectValue)
	// 		alert("Please Select Value");
	// }

	// private FindSelectValue(Id: string): string | undefined {
	// 	const Select = (document.getElementById(Id) as HTMLElement)?.querySelector('select');

	// 	return Select?.value;
	// }

	private PlayTournament() {
		this.removeDeleteButton();
		this.LaunchPong.setTournament = true;

		// this.GamePage.generateBracketTournament(0);
		let found = false;
	
		this.TournamentPage._PartyMap?.forEach(async(value: HTMLInputElement, key: number) => {
			if (value.checked) {
				this.GamePage.generateBracketTournament(key);
				found = true;
				return ;
			}
		})
		if (!found)
			alert("please choose a Party");
	}

	/***********-*******playing match****************/
	private PlayRound() {
		/******************Find Next Round with this.tournamentPage._tournament*************/
		try {
			//start round
			// this.renderGame(); //to delete
			this.launchGame(this.TournamentPage._NextGameId);
		} catch (error) {
			alert('error : ' + error);
		}
	}

	private PlayGame() {
		// let found = false;
	
		// this.LocalGamePage._PartyMap?.forEach(async(value: HTMLInputElement, key: number) => {
		// 	if (value.checked) {
		// 		this.launchGame(key);
		// 		found = true;
		// 		return ;
		// 	}
		// })
		// if (!found)
		// 	alert("please choose a Party");
	}

	private async launchGame(gameId: number) {
		try {
			const request = await startGame(gameId);
			if (!request.ok) {
				throw new Error('Unable to start game : ' + request.error);
			}
			// state.launchGame(gameId);
			this.StatePage = PageState.MOD;
			this.renderGame(gameId);
		} 
		catch (error) {
			alert(error);
			await navigate('/game');
		}
	}

	private renderGame(gameId: number) {
		this.StatePage = PageState.WIN;
		this.removeDeleteButton();
		this.LaunchPong.render(gameId);
		console.log("pagestate = ", this.StatePage);
	}


	private async SaveNewParty() {
		this.ChangeBackPageButtonText([document.getElementById("Return-btn") as HTMLButtonElement, "Return"]
		, [document.getElementById("Save-btn")  as HTMLButtonElement, "Play"]);
		this.addDeleteButton();
		console.log("state page = ", this.StatePage);
		// if (this.LocalGamePage._NewGameForm && !this.LocalGamePage._NewGameForm.classList.contains("hidden")) {
		// 	/**save 1v1**/
		// 	this.saveParty()
		// 	this.StatePage = PageState.PARTY;
		// 	this.LocalGamePage._NewGameForm.classList.add("hidden");
		// 	await this.LocalGamePage.refreshAvailableGames();
		// }
		// if (this.TournamentPage._NewTournamentForm && !this.TournamentPage._NewTournamentForm.classList.contains("hidden")) {
		// 	/**save tournament**/
		// 	this.saveTournament();
		// 	this.StatePage = PageState.TOURNAMENT;
		// 	this.TournamentPage._NewTournamentForm.classList.add("hidden");
		// 	await this.TournamentPage.refreshAvailableTournament();
		// }
	}

	private async saveParty() {
		try {
			const req = await getUserInfo();
			if (!req.ok)
			{
			    console.log('Error GamePage: ', req.error);
			    alert("Error GamePage" + req.error);
			    return ;
			}
			const userData = req.userInfo;
			if (!userData?.id)
				throw new Error('user not connected');
			// Add here the field for the max score in game creation, as a third parameter
			console.log('arg in create local game ', this.LocalGamePage._PlayerA, this.LocalGamePage._PlayerB, this.LocalGamePage._MaxScore, this.LocalGamePage._Ai, this.LocalGamePage._option);
			const request = await createLocalGame(this.LocalGamePage._PlayerA, this.LocalGamePage._PlayerB, this.LocalGamePage._MaxScore, this.LocalGamePage._Ai, this.LocalGamePage._option);
			if (!request.ok) 
				throw new Error('Failed to create Game');
			else if (request.ok) {
				const id:number = request.gameId;
				console.log("id party = ", request);
				this.launchGame(id);
			}
		}
		catch (error) {
			console.log("Error creating Games : ", error);
			alert('Error creating Game PLease try again: ' + error);
		}
	}

	private async saveTournament() {
		/****************************function for call API to save tounrnament**********************/
		const formData = new FormData(document.getElementById('new-tournament-form') as HTMLFormElement);

		// also you can use this.tournamentPage._FormMap
		// this.TournamentPage._FormMap.forEach((value: HTMLInputElement , key :(string) HTMLElement) => {
		// 	console.log("key = ", key, "value = ", value);
		// })
		const PlayerA = this.GetDataForm('Player1', formData);
		const PlayerB = this.GetDataForm('Player2', formData);
		const PlayerC = this.GetDataForm('Player3', formData);
		const PlayerD = this.GetDataForm('Player4', formData);

		const playersList = [PlayerA, PlayerB, PlayerC, PlayerD];
		console.log('playerList', playersList);
		
		const nameElement = document.getElementById('name-tournament-input') as HTMLInputElement;
		const tournamentName = nameElement.value;
		if (!tournamentName)
			alert("Please enter a tournament name.");
		console.log('Tournament name is ', tournamentName);

		const res = await createTournament(tournamentName, playersList);
		if (!res.ok) {
			alert("Error: " + res.error);
		}
		// You can get all the data about the created tournament if you like

	}

	private GetDataForm(id: string, formData: any): string {
		const PlayerRaw = formData.get(id);
		console.log("Raw values: ", PlayerRaw);
		console.log("types:", typeof PlayerRaw);

		const Player = (PlayerRaw as string)?.trim() || "";
		console.log('After trim:', Player );
		console.log('Lengths:', Player.length);
		if (!Player)
			alert('Please enter all players names');
		return Player;
	}

	/*************************************Function utils*************************************/
	ChangeBackPageButtonText(Return: [ReturnBtn: HTMLButtonElement, ReturnText: string], Save: [Savebtn: HTMLButtonElement, SaveText: string]) {
		this.ChangeButtonText(Return[0], Return[1]);
		this.ChangeButtonText(Save[0], Save[1]);
	}

	private ChangeButtonText(btn: HTMLButtonElement, TextContent: string) {
		btn.textContent = TextContent;
	}
	
	addDeleteButton() {
		const deletebtn = document.getElementById("delete-btn");
		deletebtn?.classList.remove('hidden');
	}
	
	private removeDeleteButton() {
		const deletebtn = document.getElementById("delete-btn");
		deletebtn?.classList.add('hidden');
	}
	
	set setStatePage(State: number) {
		this.StatePage = State;
	}

}