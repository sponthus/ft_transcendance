import { popUp } from '../../Utils/popUp.js';
import { renderScene } from '../../babylon/displaying/renderScene.js';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';
import { LocalGamePage } from './LocalGamePage.js';
import { TournamentPage } from "./tounramentPage.js";
import { Event } from './Event.js';
import { PageState } from "./Event.js";
import { getUserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { endGamePage } from './endGamePage.js';

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
	id: number
	username: string;
	nickname: string;
	avatar: string;
	slug: string;
	created_at: string;
};

export async function renderDropdown(Parent: HTMLElement, Options: string[], Name: string, TextContent: string): Promise<void> {
	const Div = createDropdownDiv(Options, Name, TextContent, 
		["flex items-center w-full h-[10%] justify-between p-4 bg-orange-300 focus:bg-orange-400  rounded-lg py-3 px-4 space-x-4",
		"w-[40%]  text-emerald-600 font-bold underline", 
		"w-[30%]  bg-orange-400 rounded-lg text-emerald-700"]);
	append(Parent, [Div]);
}

export class GamePage extends popUp {

	private Page!: HTMLElement;
	private LocalGamePage!: LocalGamePage;
	private TournamentPage!: TournamentPage;
	private EndGamePage!: endGamePage;
	private Event!: Event;
	private render!: renderScene;
	private userName!: string;

	constructor(render: renderScene) {
		super("Pong Game");
		this.render = render;
		this.startGamePage();
	}
	
	async startGamePage() {
		this.getUsername();
		this.initPage();
		this.initPopUpPage();
		this.EndGamePage = new endGamePage(this.Page);
		this.LocalGamePage = new LocalGamePage(this.Page, this.userName!);
		this.TournamentPage = new TournamentPage(this.Page, this.userName!);
		this.Event = new Event(this.LocalGamePage, this.TournamentPage, this);
		this._Title.remove();
		this.generateGamePage();
	}

	private async getUsername(){
		try {
			const req = await getUserInfo();
			if (req.ok) {
				const userData = req.userInfo;
				this.userName = userData.username;
				console.log("add username ", this.userName);
			}
		} catch(error) {
			alert (error);
		}
	}

	private async initPage() {
		this.Page = document.createElement('div');
		this.Page.className = "flex flex-col items-center h-[80%] w-[80%] text-center transition-all duration-300 rounded-xl space-y-4";
	}

	private async initPopUpPage() {
		this._Body.className = "flex flex-col items-center justify-center h-[70%] w-[70%] transition-all duration-300 rounded-xl shadow-2xl";
		this._Body.style.backgroundImage = "url('/background1.gif')";
		this._Body.style.backgroundPosition = "center";
		this._Body.style.backgroundSize = "cover";
		this._Title.textContent = "";
		this.Title.className = "flex items-center justify-between h-[0%]"
		this._Body.appendChild(this.Page);
	}

	/*********************************************function for rendering tournament Mod Page**********************************************/
	async generateTournamentPage() {
		this._Body.className = "relative flex flex-col items-center justify-center  h-[70%] w-[30%] transition-all duration-300 rounded-xl shadow-2xl";
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.TournamentPage.render();
			this.Event.manageTournamentEvent();
		} ,300);
	}

	async generateNewTournamentPage() {
		this.TournamentPage._playBtn.classList.add('translate-x-96');
		this.TournamentPage._continueBtn.classList.add('-translate-x-96');
		this.TournamentPage._backBtn.classList.add('-translate-x-96');
		this._Body.className = "relative flex flex-col items-center justify-center  h-[90%] w-[50%] transition-all duration-300 rounded-xl shadow-2xl";
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.TournamentPage.renderNewTournament();
			this.Event.manageNewTournamentEvent();
			// manage new tournament event
		} , 300);	
	}

	async generateContinueTournamentPage() {
		this.TournamentPage._playBtn.classList.add('translate-x-96');
		this.TournamentPage._continueBtn.classList.add('-translate-x-96');
		this.TournamentPage._backBtn.classList.add('-translate-x-96');
		this._Body.className = "relative flex flex-col items-center justify-center  h-[90%] w-[50%] transition-all duration-300 rounded-xl shadow-2xl";
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.TournamentPage.renderContinueTournament();
			this.Event.manageContinueTournamentEvent();
			// manage new tournament event
		} , 300);
	}

	async generateBracketTournament(IdTournament: number) {
		this._Body.className = "relative flex flex-col items-center justify-center  h-[90%] w-[50%] transition-all duration-300 rounded-xl shadow-2xl";
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.TournamentPage.renderBracket(IdTournament);
			// this.Event.manageContinueTournamentEvent();
			// manage new tournament event
		} , 300);
	}

	/*********************************************function for rendering 1v1 Mod Page**********************************************/
	async generate1v1GamePage() {
		this._Body.className = "relative flex flex-col items-center justify-center  h-[70%] w-[30%] transition-all duration-300 rounded-xl shadow-2xl";
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.LocalGamePage.render();
			this.Event.managePlaye1v1GameEvent();
		} ,300);
    }
	
	async generate1v1SettingPage(){
		this._Body.className = "relative flex flex-col items-center justify-center h-[80%] w-[35%] transition-all duration-300 rounded-xl shadow-2xl";
		this.LocalGamePage._playBtn.classList.add('translate-x-96');
		this.LocalGamePage._settingBtn.classList.add('-translate-x-96');
		this.LocalGamePage._backBtn.classList.add('-translate-x-96');
		this.Page.className = "flex flex-col items-center w-full h-full transition-all opacity-0 duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.cleanPage();
			this.LocalGamePage.renderSetting();
			this.Event.manageSettingEvent();
		}, 300);
	}

	/*********************************************function for rendering Game Mod Select Page**********************************************/
	async generateGamePage() {
		this.Page.classList.add("justify-center");
		this.createGamePageDiv();
	}

	async generateEndGamePage() {
		this.Event.ChangeBackPageButtonText([(document.getElementById("Return-btn") as HTMLButtonElement), "Return to Lobby"], [(document.getElementById("Save-btn") as HTMLButtonElement), "new game"]);
		this.EndGamePage.render();
	}

	/*********************************************function Utils for rendering Game Mod Select Page**********************************************/
	private async createGamePageDiv() {
		this._Body.className = "flex flex-col items-center justify-center h-[70%] w-[70%] bg-orange-300 rounded-xl shadow-2xl transition-all duration-300";
		this.Page.className = "flex flex-wrap items-center justify-center w-full h-full  text-center transition-all duration-300 space-y-4 rounded-xl shadow-2xl overflow-hidden";
		const buttondiv: HTMLElement = createDiv("button-mod", "flex flex-row h-full w-full");
		append(buttondiv, [this.create1v1button(), this.createTournamentButton()]);
		append(this.Page, [buttondiv]);
		this.Event.manageGameModEvent();
	}

	private create1v1button(): HTMLButtonElement {
		const OneVsOneBtn: HTMLButtonElement = (createButton("1v1", "group relative flex items-center justify-center h-full w-[50%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105", "") as HTMLButtonElement);
		append(OneVsOneBtn, [createImage("1v1", "absolute object-cover object-center h-full w-full opacity-40 group-hover:opacity-75", '1v1-page.png')
							, createElement('h1', '1v1', '1v1', 'z-10 text-emerald-600 text-center group-hover:font-bold text-6xl')]);
		return OneVsOneBtn;
	}

	private createTournamentButton(): HTMLButtonElement {
		const Tournamentbtn: HTMLButtonElement = (createButton("tournament", "group relative flex items-center justify-center h-full w-[50%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105", "") as HTMLButtonElement);
		append(Tournamentbtn, [createImage("tournament", "absolute object-cover object-center h-full w-full opacity-40 group-hover:opacity-75", 'tournament-page.png')
							, createElement('h1', 'tournament', 'tournament', 'z-10 text-emerald-600 text-center group-hover:font-bold text-6xl')]);
		return Tournamentbtn;
	}

	/*********************************************Global rendering function*********************************************/
	renderGamePage() {
		this.Event.render();
		this.addOverlayToWindow();
		this.Event.ManageEvent();
	}

	async cleanPage() {
		Array.from(this.Page.children).forEach((child)=>{
			Array.from(child.children).forEach((children) => {children.remove();})
			child.remove();
		})
	}

	cleanStubborn() {
		// Array.from(this._Title.children).forEach((child=> {
		// 	child.remove();
		// }))
	}

	get Body(): HTMLElement {
		return this._Body;
	}

	get _Page(): HTMLElement {
		return this.Page;
	}

	get _render(): renderScene {
		return this.render;
	}
}
