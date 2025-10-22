import { createButton} from '../../Utils/elementMaker.js';
import { createLocalGame, startGame } from "../../api/game-service/games/game.js"
import { LocalGamePage } from './LocalGamePage.js';
import { GamePage } from './GamePage.js';
import { navigate } from '../../core/router.js';
import { launchPong } from './LaunchPong.js';
import { TournamentPage } from './tounramentPage.js';
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";
import { createTournament } from "../../api/game-service/tournaments/newTournament.js";
import { ErrorPopup } from '../ErrorPage.js';
import { AllUsers, getAllUsers } from '../../api/user-service/menu/getAllUsers.js';
import { TournamentsInfos } from '../../api/game-service/tournaments/getTournaments.js';

export enum PageState {MOD = 0, TOURNAMENT = 1, PARTY = 2, LOCALSETTING = 3, NEWTOURNAMENT = 4, CONTINUETOURNAMENT = 5, BRACKET = 6, WAITING = 7, WIN = 8};
type USer = {slug: string, username: string};

export class Event {


	private StatePage!: number;
	private LocalGamePage!: LocalGamePage;
	private TournamentPage!: TournamentPage;
	private GamePage: GamePage;
	private LaunchPong: launchPong;
	private UserTab: AllUsers[] = [];
	private TournamentNameMap: USer[] = [];

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
		await this.fillUserTab();
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
			    await ErrorPopup("Error GamePage" + req.error);
			    return ;
			}
			const userData = req.userInfo;
			if (!userData?.id)
				throw new Error('user not connected');
			const request = await createLocalGame(this.LocalGamePage._PlayerA, this.LocalGamePage._PlayerB, this.LocalGamePage._MaxScore, this.LocalGamePage._Ai, this.LocalGamePage._option);
			if (!request.ok) 
				throw new Error('Failed to create Game');
			else {
				const id:number = request.gameId;
				this.launchGame(id, false);
			}
		}
		catch (error) {
			await ErrorPopup('Error creating Game PLease try again: ' + error);
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
		this.SetUpPlayers();
		this.StatePage = PageState.PARTY;
		await this.GamePage.generate1v1GamePage();
	}

	private SetUpPlayers() {
		if (this.LocalGamePage._Ai === 0) {
			if (this.LocalGamePage._PlayerA && !this.LocalGamePage._PlayerA.startsWith('@'))
				this.LocalGamePage.setPlayerA = this.LocalGamePage._playerAInput.value;
			if (this.LocalGamePage._PlayerB && !this.LocalGamePage._PlayerB.startsWith('@'))
				this.LocalGamePage.setPlayerB = this.LocalGamePage._playerBinput.value;
		}
	}

	/**********active bot player button**********/
	private ActiveBotBtn() {
		if (this.LocalGamePage._Ai == 0) {
			this.LocalGamePage._botBtn.classList.remove('hover:scale-110');
			this.LocalGamePage._botBtn.classList.add('scale-110');
			this.LocalGamePage._playerBtn.classList.add('hover:scale-110');
			this.LocalGamePage._playerBtn.classList.remove('scale-110');
			this.LocalGamePage.setPlayerAInput = this.LocalGamePage._userData.username;
			this.LocalGamePage.setPlayerA = '@' + this.LocalGamePage._userData.slug;
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
			this.LocalGamePage.setPlayerAInput = this.LocalGamePage._userData.username;
			this.LocalGamePage.setPlayerA = '@' + this.LocalGamePage._userData.slug;
			this.LocalGamePage.setPlayerAReadonly = true;
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
		this.reversePlayerName();
		if (this.LocalGamePage._Ai === 1)
			this.LocalGamePage.setAi = 2;
		else if (this.LocalGamePage._Ai === 2)
			this.LocalGamePage.setAi = 1;
	}

	private reversePlayerName() {
		const tmpA = this.LocalGamePage._PlayerA;
		const tmpB = this.LocalGamePage._PlayerB;
		if (tmpB.startsWith('@')) {
			this.LocalGamePage.setPlayerA = '@' + this.LocalGamePage._userData.slug;
			this.LocalGamePage._playerAInput.readOnly = true;
		}
		else {
			this.LocalGamePage.setPlayerA = this.LocalGamePage._playerAInput.value;
			this.LocalGamePage._playerAInput.readOnly = false;
		}
		if (tmpA.startsWith('@')) {
			this.LocalGamePage.setPlayerB = '@' + this.LocalGamePage._userData.slug;
			this.LocalGamePage._playerBinput.readOnly = true;
		}
		else {
			this.LocalGamePage.setPlayerB = this.LocalGamePage._playerBinput.value;
			this.LocalGamePage._playerBinput.readOnly = true;
		}
	}

	/**********increase score limit**********/
	private clickPlusEvent() {
		if (this.LocalGamePage._MaxScore < 15) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  + 5;
			this.LocalGamePage._maxScoreP.textContent = this.LocalGamePage._MaxScore.toString();
		}
	}

	/**********decrease score limit**********/
	private clickminusEvent() {
		if (this.LocalGamePage._MaxScore > 5) {
			this.LocalGamePage.setMaxScore = this.LocalGamePage._MaxScore  - 5;
			this.LocalGamePage._maxScoreP.textContent = this.LocalGamePage._MaxScore.toString();
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
		if (this.TournamentPage._nameMap)
			await this.searchUSer();
	}

	private async searchUSer() {
		this.TournamentPage._nameMap.forEach((value, key) => {
			if (key === 1) {
				this.UserTab.forEach(users => {
					if (value.value === users.username)
						this.TournamentNameMap[key - 1] = ({slug: '@'+ users.slug, username: users.username});})}
			else
				this.TournamentNameMap[key - 1] = ({slug: value.value, username: value.value});
			value.addEventListener('input', () => {
				const div = document.getElementById(`user-${key}-div`);
				if (value.value[0] == '@' && value.value.length > 1) {
					if (div) {
						div.classList.remove('opacity-0');
						div.classList.remove('hidden');
						this.handleInput(div, value, key - 1);
					}
				}
				else {
					if (div) {
						Array.from(div.children).forEach(child=> {child.remove();});
						div.classList.add('opacity-0');
						div.classList.add('hidden');
						if (this.TournamentNameMap[key - 1].username != value.value)
							this.TournamentNameMap[key - 1] = ({slug: value.value, username: value.value});
					}	
				}
			})
		});
	}

	private handleInput(div: HTMLElement, input: HTMLInputElement, index: number) {
		Array.from(div.children).forEach(child=> {child.remove();});
		this.UserTab.forEach(value => {
			if (value.username.toLocaleLowerCase().substring(0, input.value.toLocaleLowerCase().length - 1) === input.value.substring(1, input.value.length)) {
				const btn: HTMLButtonElement = createButton(`${value.username}`, 'activate:scale-95 hover:bg-orange-200', value.username);
				div.appendChild(btn);
				btn.addEventListener('click', () => {
					this.TournamentNameMap[index] = ({slug: '@' + value.slug, username: value.username});
					input.value = value.username;
					div.classList.add('opacity-0');
					div.classList.add('hidden');
				})
			}
		})
	}

	private async fillUserTab() {
		try {
			const req = await getAllUsers();
			if (req.ok) {
				this.UserTab = req.users;
			}
		} catch(error) {
			await ErrorPopup(error as string);
		}
	}

	async manageWaitingScreenEvent() {
		if (this.TournamentPage._backBtn)
			this.TournamentPage._backBtn.addEventListener('click', async() => {this.continueTournament();});
	}


	/**********save new tournament**********/
	private async saveTournament() {
		/****************************function for call API to save tounrnament**********************/
		/**************add Players Names in one string**************/
		let PlayersNames: string[] = [];
		this.TournamentNameMap.forEach(name => {PlayersNames.push(name.slug)});

		try {
			if (!this.TournamentPage._tournamentName.value) {
				throw new Error("Please enter a tournament name.");
			}
			const res = await createTournament(this.TournamentPage._tournamentName.value, PlayersNames, this.TournamentPage._option);
			if (res.ok) {
				if (res.tournament.status === "invitations") {
					this.StatePage = PageState.WAITING;
					this.GamePage.generateWaitingScreen(res.tournament.tournament_id);
				}
				else {
					this.StatePage = PageState.BRACKET;
					this.GamePage.generateBracketTournament(res.tournament.tournament_id);
				}
			}
			if (!res.ok)
				throw new Error(res.error);
		} catch (error) {
			await ErrorPopup(error as string);
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

	private continueOneTournament(btn: HTMLButtonElement, game: TournamentsInfos){
		btn.addEventListener('click', async() => {
			if (game.status == 'invitations') {
				this.StatePage = PageState.WAITING;
				this.GamePage.generateWaitingScreen(game.id);
			}
			else {
				this.setStatePage = PageState.BRACKET;
				this.GamePage.generateBracketTournament(game.id);
			}
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
	private async PlayRound() {
		/******************Find Next Round with this.tournamentPage._tournament*************/
		try {
			this.launchGame(this.TournamentPage._NextGameId, true);
		} catch (error) {
			await ErrorPopup('error : ' + error);
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
			await ErrorPopup(error as string);
			await navigate('/game');
		}
	}

	private renderGame(gameId: number, tournament: boolean) {
		this.StatePage = PageState.WIN;
		this.LaunchPong.render(gameId, tournament);
	}


	/*************************************Function utils*************************************/	
	set setStatePage(State: number) {
		this.StatePage = State;
	}

}