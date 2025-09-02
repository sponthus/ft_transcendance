import { createDiv, createButton, append} from '../../Utils/elementMaker.js';
import { createLocalGame, startGame } from "../../api/game.js"
import { LocalGamePage } from './LocalGamePage.js';
import { GamePage } from './GamePage.js';
import { navigate } from '../../core/router.js';
import { launchPong } from './LaunchPong.js';
import { TournamentPage } from './tounramentPage.js';
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";

export enum PageState {MOD = 0, TOURNAMENT = 1, PARTY = 2, NEWGAME = 3, BRACKET = 4};

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
		const SaveBtn: HTMLButtonElement = createButton("Save", ClassNameBtn, "Save");

		append(Div, [ReturnBtn, DeleteBtn, SaveBtn]);
		append(this.GamePage.Body, [Div]);
	}

	/*************************************Function for Manage Event Return and Save button*************************************/
	async ManageEvent() {
		this.ManageSaveEvent();
		this.ManageReturnEvent();
	}

	async manageNewGameEvent() {
		document.getElementById('New-btn')?.addEventListener('click', async () => {
			this.ChangeBackPageButtonText([document.getElementById("Return-btn") as HTMLButtonElement, "Cancel"]
			, [document.getElementById("Save-btn")  as HTMLButtonElement, "Save New Game"]);
	
			if (this.StatePage == PageState.PARTY) {
				this.StatePage = PageState.NEWGAME;
				this.removeDeleteButton();
				this.LocalGamePage._NewGameForm.classList.remove("hidden");
			}
			else if (this.StatePage == PageState.TOURNAMENT) {
				this.StatePage = PageState.NEWGAME;
				this.removeDeleteButton();
				this.TournamentPage._NewTournamentForm.classList.remove("hidden");
			}
		});
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
				case PageState.NEWGAME:
					this.CancelNewGame();
					break;
				case PageState.BRACKET:
					this.returnToTournament();
					break;
				default: break;
			}
		})
	}

					/*********************************function utils for return*********************************/
	private ReturnToLobby(){
		this.GamePage.cleanPage();
		this.GamePage.cleanBody();
		this.GamePage.removeOverlayToWindow();
		this.GamePage.startGamePage();
		this.LaunchPong.returnLobby();
	}

	private returnToGameMod() {
		this.ChangeButtonText(document.getElementById("Save-btn") as HTMLButtonElement, "Save");
		this.StatePage = PageState.MOD;
		Array.from(this.GamePage._Page.children).forEach((child)=>{
			child.remove();
		})

		this.removeDeleteButton();

		this.GamePage._Page.classList.add("border-4");
		this.GamePage.generateGamePage();
	}

	private CancelNewGame() {
		this.ChangeBackPageButtonText([document.getElementById("Return-btn") as HTMLButtonElement, "Return"]
		, [document.getElementById("Save-btn")  as HTMLButtonElement, "Play"]);

		console.log("cancel fgame function called");
		if (this.LocalGamePage._NewGameForm && !this.LocalGamePage._NewGameForm.classList.contains("hidden")) {
			console.log("we are in localgame page");
			this.StatePage = PageState.PARTY;
			this.LocalGamePage._NewGameForm.classList.add('hidden');
		}
		else if (this.TournamentPage._NewTournamentForm && !this.TournamentPage._NewTournamentForm.classList.contains("hidden")) {
			console.log("we are in tournament page");
			this.StatePage = PageState.TOURNAMENT;
			this.TournamentPage._NewTournamentForm.classList.add("hidden");
		}
	
		this.addDeleteButton();
	}

	private async returnToTournament() {
		this.StatePage = PageState.TOURNAMENT;
		await this.GamePage.generateTournamentPage();
	}

	/*************************************Function for Event Save button*************************************/
	private async ManageSaveEvent() {
		 document.getElementById("Save-btn")?.addEventListener('click', async(e) => {
				switch(this.StatePage) {
				case PageState.MOD:
					this.SaveGameMod();
					break;
				case PageState.PARTY:
					this.PlayGame();
					break;
				case PageState.TOURNAMENT:
					this.PlayTournament();
					break;
				case PageState.NEWGAME:
					this.SaveNewParty();
					break;
				case PageState.BRACKET:
					this.PlayRound();
					break;
				default: break;
			}
		})
	}

				/*********************************function utils for saving games*********************************/
	private async SaveGameMod() {
		const SelectValue = this.FindSelectValue("GameMod-DropDown-div");
		if (SelectValue == "1v1") {
			this.StatePage = PageState.PARTY;
			await this.GamePage.generate1v1GamePage();
		}
		else if (SelectValue == "tournament")
		{
			this.StatePage = PageState.TOURNAMENT;
			await this.GamePage.generateTournamentPage();
			// alert("tournament in build please choose 1v1 mode");
		}
		else if (!SelectValue)
			alert("Please Select Value");
	}

	private FindSelectValue(Id: string): string | undefined {
		const Select = (document.getElementById(Id) as HTMLElement)?.querySelector('select');

		return Select?.value;
	}

	private PlayTournament() {
		this.removeDeleteButton();
		this.StatePage = PageState.BRACKET;
		this.GamePage.generateBracketTournament(0);
		// let found = false;
	
		// this.TournamentPage._PartyMap?.forEach(async(value: HTMLInputElement, key: number) => {
		// 	if (value.checked) {
		// 		this.GamePage.generateBracketTournament(key);
		// 		found = true;
		// 		return ;
		// 	}
		// })
		// if (!found)
		// 	alert("please choose a Party");
	}

	private PlayRound() {
		/******************Find Next Round with this.tournamentPage._tournament*************/
		try {
			// find round id
			//start round
			this.renderGame();
		} catch (error) {
			alert('error : ' + error);
		}
	}

	private PlayGame() {
		let found = false;
	
		this.LocalGamePage._PartyMap?.forEach(async(value: HTMLInputElement, key: number) => {
			if (value.checked) {
				this.launchGame(key);
				found = true;
				return ;
			}
		})
		if (!found)
			alert("please choose a Party");
	}

	private async launchGame(gameId: number) {
		try {
			const request = await startGame(gameId);
			if (!request.ok) {
				throw new Error('Unable to start game : ' + request.error);
			}
			// state.launchGame(gameId);
			this.StatePage = PageState.MOD;
			this.renderGame();
		} 
		catch (error) {
			alert(error);
			await navigate('/game');
		}
	}

	private renderGame() {
		this.LaunchPong.render();
	}


	private async SaveNewParty() {
		this.ChangeBackPageButtonText([document.getElementById("Return-btn") as HTMLButtonElement, "Return"]
		, [document.getElementById("Save-btn")  as HTMLButtonElement, "Play"]);
		this.addDeleteButton();
		console.log("state page = ", this.StatePage);
		if (this.LocalGamePage._NewGameForm && !this.LocalGamePage._NewGameForm.classList.contains("hidden")) {
			this.saveParty()
			this.StatePage = PageState.PARTY;
			this.LocalGamePage._NewGameForm.classList.add("hidden");
			await this.LocalGamePage.refreshAvailableGames();
		}
		else if (this.TournamentPage._NewTournamentForm && !this.TournamentPage._NewTournamentForm.classList.contains("hidden")) {
			this.saveTournament();
			this.StatePage = PageState.TOURNAMENT;
			this.TournamentPage._NewTournamentForm.classList.add("hidden");
			await this.TournamentPage.refreshAvailableTournament();
		}
	}

	private saveParty() {
		const formData = new FormData(document.getElementById('new-game-form') as HTMLFormElement) ;

		const PlayerA = this.GetDataForm('Player1', formData);
		const PlayerB = this.GetDataForm('Player2', formData);

		if (!PlayerA || !PlayerB)
			return ;
		if (PlayerA === PlayerB) {
			alert('Player names must be different');
			return;
		}
		this.addPartyToServer(PlayerA, PlayerB);
		alert('Game created successfully!');
	}

	private saveTournament() {
		/****************************function for call API to save tounrnament**********************/
		const formData = new FormData(document.getElementById('new-tournament-form') as HTMLFormElement) ;

		// const PlayerA = this.GetDataForm('Player1', formData); Player1, Player2, Player3 etc...

	}

	private GetDataForm(id: string, formData: any): string {
		const PlayerRaw = formData.get(id);
		console.log("Raw values: ", PlayerRaw);
		console.log("types:", typeof PlayerRaw);

		const Player = (PlayerRaw as string)?.trim() || "";
		console.log('After trim:', Player );
		console.log('Lengths:', Player.length);
		if (!Player)
			alert('Please enter both player names');
		return Player;
	}
	
	private async addPartyToServer(PlayerA: string, PlayerB: string) {
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
			const request = await createLocalGame(userData?.id, PlayerA, PlayerB);
			if (!request.ok) 
				throw new Error('Failed to create Game');
		}
		catch (error) {
			console.log("Error creating Games : ", error);
			alert('Error creating Game PLease try again: ' + error);
		}
	}

	/*************************************Function utils*************************************/
	private ChangeBackPageButtonText(Return: [ReturnBtn: HTMLButtonElement, ReturnText: string], Save: [Savebtn: HTMLButtonElement, SaveText: string]) {
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