import { createDiv, createButton, append} from '../../Utils/elementMaker.js';
import { createLocalGame, startGame } from "../../api/game-service/games/game.js"
import { LocalGamePage } from './LocalGamePage.js';
import { GamePage } from './GamePage.js';
import { navigate } from '../../core/router.js';
import { launchPong } from './LaunchPong.js';
import { TournamentPage } from './tounramentPage.js';
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";
import { createTournament } from "../../api/game-service/tournaments/newTournament.js";
import { ErrorPopup } from '../ErrorPage.js';

export enum PageState {MOD = 0, TOURNAMENT = 1, PARTY = 2, LOCALSETTING = 3, NEWTOURNAMENT = 4, CONTINUETOURNAMENT = 5, BRACKET = 6, WIN = 7};

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
	}

	/*************************************Function for Manage Event Return and Save button*************************************/
	async ManageEvent() {
		if (this.StatePage === PageState.MOD)
			this.manageGameModEvent();
	}

	/*********************************function utils for return*********************************/
	private ReturnToLobby(){
		this.StatePage = PageState.MOD;
		this.LaunchPong.returnLobby();
	}

	private returnToGameMod() {
		this.StatePage = PageState.MOD;
		Array.from(this.GamePage._Page.children).forEach((child)=>{
			child.remove();
		})
		this.GamePage.generateGamePage();
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
		if (this.GamePage._backBtn)
			this.GamePage._backBtn.addEventListener('click', async() => {this.ReturnToLobby();});
	}

	/*************************************Functions for 1v1 Event*************************************/
	async managePlaye1v1GameEvent() {
		if (this.LocalGamePage._playBtn){
			this.LocalGamePage._playBtn.addEventListener('click', async() => {this.saveParty();})};
		if (this.LocalGamePage._settingBtn)
			this.LocalGamePage._settingBtn.addEventListener('click', async() => {this.GoTo1v1setting()});
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.addEventListener('click', async() => {this.returnToGameMod();});
	}

	private async saveParty() {
		try {
			const req = await getUserInfo();
			if (!req.ok)
			{
			    console.log('Error GamePage: ', req.error);
			    ErrorPopup("Error GamePage" + req.error);
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
				this.launchGame(id, false);
			}
		}
		catch (error) {
			console.log("Error creating Games : ", error);
			ErrorPopup('Error creating Game PLease try again: ' + error);
		}
	}

	/*************************************Functions for 1v1 setting Event*************************************/

	private async GoTo1v1setting() {
		this.StatePage = PageState.LOCALSETTING;
		await this.GamePage.generate1v1SettingPage();
	}

	async manageSettingEvent() {
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.addEventListener('click', async() => {this.returnTo1v1Game();});
		if (this.LocalGamePage._botBtn)
			this.LocalGamePage._botBtn.addEventListener('click', async() => {this.ActiveBotBtn();});
		if (this.LocalGamePage._playerBtn)
			this.LocalGamePage._playerBtn.addEventListener('click', async() => {this.activePlayervsBtn();});
		if (this.LocalGamePage._reversebtn)
			this.LocalGamePage._reversebtn.addEventListener('click', async() => {this.reversePlayer();});
		if (this.LocalGamePage._optionbtn)
			this.LocalGamePage._optionbtn.addEventListener('click', async() => {this.ClickOptionEvent();});
		if (this.LocalGamePage._minusbtn)
			this.LocalGamePage._minusbtn.addEventListener('click', async() => {this.clickminusEvent();});
		if (this.LocalGamePage._plusbtn)
			this.LocalGamePage._plusbtn.addEventListener('click', async() => {this.clickPlusEvent();});
	}

	/**********return to 1v1 page**********/
	private async returnTo1v1Game() {
		if (this.LocalGamePage._backBtn)
			this.LocalGamePage._backBtn.classList.add('-translate-x-96');
		if (this.LocalGamePage._settingPan)
			this.LocalGamePage._settingPan.classList.add('translate-x-96');
		this.StatePage = PageState.PARTY;
		await this.GamePage.generate1v1GamePage();
	}

	/**********active bot player button**********/
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

	/**********active 1v1 player button**********/
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

	private reversePlayer() {
		const tmp: string = this.LocalGamePage._playerAInput.value;
		this.LocalGamePage.setPlayerAInput = this.LocalGamePage._playerBinput.value;
		this.LocalGamePage.setPlayerBInput = tmp;
		if (this.LocalGamePage._Ai === 1)
			this.LocalGamePage.setAi = 2;
		else if (this.LocalGamePage._Ai === 2)
			this.LocalGamePage.setAi = 1;
	}

	/**********increase score limit**********/
	private clickPlusEvent() {
		if (this.LocalGamePage._MaxScore < 15) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  + 5;
			this.LocalGamePage._maxScoreP.textContent = this.LocalGamePage._MaxScore.toString();
			console.log("maxscore : ", this.LocalGamePage._MaxScore );
		}
	}

	/**********decrease score limit**********/
	private clickminusEvent() {
		if (this.LocalGamePage._MaxScore > 5) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  - 5;
			this.LocalGamePage._maxScoreP.textContent = this.LocalGamePage._MaxScore.toString();
			console.log("maxscore : ", this.LocalGamePage._MaxScore );
		}
	}

	/**********set crabmehameha option for 1v1**********/
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
		if (this.TournamentPage._backBtn)
			this.TournamentPage._backBtn.addEventListener('click', async() => {this.returnToGameMod();});
		if (this.TournamentPage._playBtn){
			this.TournamentPage._playBtn.addEventListener('click', async() => {this.renderNewTournament()})};
		if (this.TournamentPage._continueBtn)
			this.TournamentPage._continueBtn.addEventListener('click', async() => {this.continueTournament();});
	}

	/**********return to tournament page**********/
	private async returnToTournament() {
		this.StatePage = PageState.TOURNAMENT;
		await this.GamePage.generateTournamentPage();
	}

	/**********rendering new tournament page**********/
	private async renderNewTournament() {
		this.StatePage = PageState.NEWTOURNAMENT;
		await this.GamePage.generateNewTournamentPage();
	}

	/**********rendering continue tournament page**********/
	private async continueTournament() {
		this.StatePage = PageState.CONTINUETOURNAMENT;
		await this.GamePage.generateContinueTournamentPage();
	}

	async manageNewTournamentEvent() {
		if (this.TournamentPage._backBtn)
			this.TournamentPage._backBtn.addEventListener('click', async() => {this.returnToTournament();});
		if (this.TournamentPage._playBtn)
			this.TournamentPage._playBtn.addEventListener('click', async() => {this.saveTournament()});
		if (this.TournamentPage._optionbtn)
			this.TournamentPage._optionbtn.addEventListener('click', async() => {this.ClickOptionTournamentEvent();});
	}

	/**********save new tournament**********/
	private async saveTournament() {
		/****************************function for call API to save tounrnament**********************/
		/**************add Players Names in one string**************/
		let PlayersNames: string[] = [];
		this.TournamentPage._nameMap.forEach((value, key) => {PlayersNames.push(value.value);})

		/**************check tournament name**************/

		try {
			if (!this.TournamentPage._tournamentName.value)
				throw new Error("Please enter a tournament name.");
			const res = await createTournament(this.TournamentPage._tournamentName.value, PlayersNames, this.TournamentPage._option);
			if (res.ok) {
				console.log('res tournament : ', res.tournament);
				console.log('id tournament : ', res.tournament.tournament_id);
				this.setStatePage = PageState.BRACKET;
				this.GamePage.generateBracketTournament(res.tournament.tournament_id);
			}
		} catch (error) {
			ErrorPopup(error as string);
		}
	}

	/**********set crabmehameha option for tounrnament**********/
	private ClickOptionTournamentEvent() {
		if (this.TournamentPage._option == 1) {
			this.TournamentPage._optionimg.src = 'game_ui/setting/uncheckedValue.png';
			this.TournamentPage.setOption = 0;
		}
		else {
			this.TournamentPage._optionimg.src = 'game_ui/setting/checkedValue.png';
			this.TournamentPage.setOption = 1;
		}
	}

	async manageContinueTournamentEvent() {
		if (this.TournamentPage._backBtn)
			this.TournamentPage._backBtn.addEventListener('click', async() => {this.returnToTournament();});
		if (this.TournamentPage._PartyMap)
			this.TournamentPage._PartyMap.forEach((value, key) => {this.continueOneTournament(value, key)})
	}

	private continueOneTournament(btn: HTMLButtonElement, id: number){
		btn.addEventListener('click', async() => {
			this.setStatePage = PageState.BRACKET;
			this.GamePage.generateBracketTournament(id);
		})
	}

	async manageBracketEvent() {
		if (this.TournamentPage._backBtn)
			this.TournamentPage._backBtn.addEventListener('click', async() => {this.returnToTournament();});
		if (this.TournamentPage._playBtn)
			this.TournamentPage._playBtn.addEventListener('click', async() => {this.PlayRound()});
	}

	async manageEndGameEvent() {
		if (this.GamePage._endGamePage._playBtn)
			this.GamePage._endGamePage._playBtn.addEventListener('click', async() => {this.returnToGameMod();});
		if (this.GamePage._endGamePage._backBtn)
			this.GamePage._endGamePage._backBtn.addEventListener('click', async() => {this.ReturnToLobby();});
	}

	/***********-*******playing match****************/
	private PlayRound() {
		/******************Find Next Round with this.tournamentPage._tournament*************/
		try {
			this.launchGame(this.TournamentPage._NextGameId, true);
		} catch (error) {
			ErrorPopup('error : ' + error);
		}
	}

	private async launchGame(gameId: number, tournament:boolean) {
		try {
			const request = await startGame(gameId);
			if (!request.ok) {
				throw new Error('Unable to start game : ' + request.error);
			}
			// state.launchGame(gameId);
			this.renderGame(gameId, tournament);
		} 
		catch (error) {
			ErrorPopup(error as string);
			await navigate('/game');
		}
	}

	private renderGame(gameId: number, tournament: boolean) {
		this.StatePage = PageState.WIN;
		this.LaunchPong.render(gameId, tournament);
		console.log("pagestate = ", this.StatePage);
	}


	/*************************************Function utils*************************************/	
	set setStatePage(State: number) {
		this.StatePage = State;
	}

}