import { popUp } from '../../Utils/popUp.js';
import { renderScene } from '../../babylon/displaying/renderScene.js';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
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
	await this.getUsername();
		this.initPage();
		this.initPopUpPage();
		this.generateGamePage();
		this.LocalGamePage = new LocalGamePage(this.Page, this.userName!);
		this.TournamentPage = new TournamentPage(this.Page, this.userName!);
		this.EndGamePage = new endGamePage(this.Page);
		this.Event = new Event(this.LocalGamePage, this.TournamentPage, this);
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

	private initPage() {
		this.Page = document.createElement('div');
		this.Page.className = "flex flex-col items-center h-[80%] w-[80%] text-center border-4 border-orange-400 rounded-xl space-y-4 overflow-hidden";
	}

	private initPopUpPage() {
		this._Body.className = "flex flex-col items-center justify-center h-[60%] w-[60%] bg-orange-300 rounded-xl border-2 border-orange-400 shadow-2xl overflow-auto";
		this._Title.classList.add("text-emerald-600");
		this._Body.appendChild(this.Page);
	}

	/*********************************************function for rendering tournament Mod Page**********************************************/
	async generateTournamentPage() {
		(document.getElementById("Save-btn") as HTMLButtonElement).textContent = "Play Tournament";
		this.cleanPage();
		this.TournamentPage.render();
		this.Event.addDeleteButton();
		this.Event.manageNewGameEvent();
	}

	async generateBracketTournament(IdTournament: number) {
		this.Event.setStatePage = PageState.BRACKET;
		(document.getElementById("Save-btn") as HTMLButtonElement).textContent = "Play Round";
		this.cleanPage();
		this.TournamentPage.renderBracket(IdTournament);
	}
	/*********************************************function for rendering 1v1 Mod Page**********************************************/
	async generate1v1GamePage() {
		(document.getElementById("Save-btn") as HTMLButtonElement).textContent = "Play";
		this.cleanPage();
		this.LocalGamePage.render();
		this.Event.addDeleteButton();
		this.Event.manageNewGameEvent();
    }

	/*********************************************function for rendering Game Mod Select Page**********************************************/
	async generateGamePage() {
		this.Page.classList.add("justify-center");
		await this.createGamePageDiv();
		await this.CreateDropDownGamePage();
	}

	async generateEndGamePage() {
		this.Event.ChangeBackPageButtonText([(document.getElementById("Return-btn") as HTMLButtonElement), "Return to Lobby"], [(document.getElementById("Save-btn") as HTMLButtonElement), "new game"]);
		this.EndGamePage.render();

	}

	/*********************************************function Utils for rendering Game Mod Select Page**********************************************/
	private async createGamePageDiv() {
		const TextDiv: HTMLElement =  createDiv("GamePage-title", "flex items-center justify-center h-[30%]");
		const GameModText: HTMLElement = createElement('h1', "GamePage-title", "Please Choose your game mod",  "text-emerald-600 text-center underline");

		append(TextDiv, [GameModText]);
		append(this.Page, [TextDiv]);
	}

	private async CreateDropDownGamePage() {
		await renderDropdown(this.Page ,["1v1", "tournament"], "GameMod", "Pong Game Mod:");
		await renderDropdown(this.Page ,["local"], "PlayerMod", "Pong player Mod :");
	}

	/*********************************************Global rendering function*********************************************/
	renderGamePage() {
		this.Event.render();
		this.addOverlayToWindow();
		this.Event.ManageEvent();
	}

	cleanPage() {
		Array.from(this.Page.children).forEach((child)=>{
			child.remove();
		})
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
