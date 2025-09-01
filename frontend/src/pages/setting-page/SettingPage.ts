import { navigate } from "../../core/router";
import { BasePage } from "../BasePage";
import { State } from "../../core/state.js";
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';
import { renderGameSetting } from "./GameSettings";
import { renderProfileSetting } from "./ProfileSetting";

const state = State.getInstance();

export class SettingPage extends BasePage {

	private front!: HTMLElement;
	private ButtonDiv!: HTMLElement;
	private SettingDiv!: HTMLElement;
	private SettingText!: HTMLElement;

	private ReturnDiv!: HTMLElement;
	constructor () {
		super();
	}

	async render(): Promise<void> {
		if (state.isLoggedIn()) {

			this.renderBanner();

			await this.createHomeSetting();
			await this.createSettingDiv();
			await this.createReturnDiv();

			await this.renderHomeSetting();
		}
		else
			navigate('/');
	}

	/*********************************************function for creating Home Setting**********************************************/
	private async createHomeSetting() {
	
			const Background: HTMLElement = this.initBackground();
			Background.className = "flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 p-8";

			this.createFrontSettting();
			this.createSettingText();
			this.createButtonDiv();			

			Background.appendChild(this.front);

			this.app.appendChild(Background);
	}

	private createFrontSettting() {
		this.front = createDiv("grid Setting_front", "rounded-xl shadow-2xl p-12 max-w-md w-full text-center space-y-4");
	}

	private createSettingText() {
		this.SettingText = createElement('h1', "setting_text", "Settings", "text-emerald-600 text-2xl py-3 px-6");
		append(this.front, [this.SettingText]);
	}

	private createButtonDiv() {
		this.ButtonDiv = createDiv("Button_setting", "flex flex-col space-y-4");
		append(this.front, [this.ButtonDiv]);
	}

	private async createSettingDiv() {
		this.SettingDiv = createDiv("setting", "flex flex-col space-y-4");
		append(this.front, [this.SettingDiv]);
	}

	private async renderHomeSetting(): Promise<void> {
		this.createGameSettingButton();
		this.createProfileSettingButton();
	}

	private createGameSettingButton() {
		const gameSettingButton = createButton("Game-Setting", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-6 rounded-lg", "Game-Setting");
		gameSettingButton.addEventListener('click', async(e) => {
			await renderGameSetting(this.SettingText, this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [gameSettingButton]);
	}

	private createProfileSettingButton() {
		const ProfileSettingButton = createButton("profile-setting", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-6 rounded-lg", "Profile Setting");
		ProfileSettingButton.addEventListener('click', async(e) => {
			await renderProfileSetting(this.SettingText, this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [ProfileSettingButton]);
	}

	/*********************************************function for creating Profile Setting**********************************************/
	private async renderProfileSetting(): Promise<void> {
		this.SettingText.textContent = "Profile Settings";
		this.ButtonDiv.classList.add('hidden');

		this.ReturnDiv.classList.remove('hidden');
	}

	/*********************************************function utils**********************************************/
	private async createReturnDiv() {
		this.ReturnDiv = createDiv("return", "grid grid-cols-2 items-center justify-between p-4 bg-transparent py-3 px-4 space-x-4 hidden");
		
		this.createReturnBtn();
		this.createSaveBtn();
		this.front.appendChild(this.ReturnDiv);
		this.manageReturnEvent();
	}

	private createReturnBtn() {
		const ReturnButton: HTMLButtonElement = createButton("return", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform", "return");

		this.ReturnDiv.appendChild(ReturnButton);
	}

	private createSaveBtn() {
		const DoneButton: HTMLButtonElement = createButton("done", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform", "Done");

		this.ReturnDiv.appendChild(DoneButton);
	}

	/*********************************************function utils for manage event**********************************************/
	private manageReturnEvent() {
		const returnBtn = document.getElementById("return-btn") as HTMLButtonElement;
		const DoneButton = document.getElementById("done-btn") as HTMLButtonElement;

		returnBtn.addEventListener('click', async(e) => {
			await this.Return();
		})

		DoneButton.addEventListener('click', async(e) => {
			await this.Return();
		})
	}

	private async Return(): Promise<void> {
		this.SettingText.textContent = "Settings";
		Array.from(this.SettingDiv.children).forEach((child, index)=>{
			child.remove();
		})
		this.ButtonDiv.classList.remove('hidden');
		this.ReturnDiv.classList.add('hidden');
	}
}