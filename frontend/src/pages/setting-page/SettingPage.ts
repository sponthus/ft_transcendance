import { navigate } from "../../core/router";
import { BasePage } from "../BasePage";
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';
import { renderGameSetting, getAvatarAsset, getCurrentNpcAsset } from "./GameSettings";
import { renderProfileSetting } from "./ProfileSetting";
import { changeNpcAsset } from "../../api/user-service/menu/npcAsset";
import { changeCharacterAsset } from "../../api/user-service/menu/characterAsset";

enum PageState {GAME = 0, PROFILE = 1};

export class SettingPage extends BasePage {

	private front!: HTMLElement;
	private ButtonDiv!: HTMLElement;
	private SettingDiv!: HTMLElement;
	private Background!: HTMLElement;
	// private SettingText!: HTMLElement;

	private statePage: number;
	private ReturnDiv!: HTMLElement;
	constructor () {
		super();
		this.statePage = 0;
	}

	async render(): Promise<void> {

		this.renderBanner();

		await this.createHomeSetting();
		await this.createSettingDiv();
		await this.createReturnDiv();

		await this.renderHomeSetting();

	}

	/*********************************************function for creating Home Setting**********************************************/
	private async createHomeSetting() {
	
			this.Background = this.initBackground();
			this.Background.className = "h-screen min-h-[1920x] w-screen min-w-[1024px] bg-gradient-to-br from-orange-100 to-orange-300 p-8";

			this.createFrontSettting();
			// this.createSettingText();
			this.createButtonDiv();	

			this.Background.appendChild(this.front);

			this.app.appendChild(this.Background);
	}

	private createFrontSettting() {
		this.front = createDiv("grid-Setting-front", "flex flex-wrap items-center  justify-center w-full h-full text-center space-y-4");
	}

	// private createSettingText() {
	// 	this.SettingText = createElement('h1', "setting_text", "Settings", "text-emerald-600 text-2xl py-3 px-6");
	// 	append(this.front, [this.SettingText]);
	// }

	private createButtonDiv() {
		this.ButtonDiv = createDiv("Button_setting", "h-full w-full");
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
		const gameSettingButton = createButton("Game-Setting", "bg-orange-300 bg-opacity-10 hover:bg-orange-400 hover:bg-opacity-50 text-emerald-600 font-bold h-full w-[50%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-6xl", "Game-Setting");
		gameSettingButton.addEventListener('click', async(e) => {
			this.statePage = 0;
			await renderGameSetting(this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [gameSettingButton]);
	}

	private createProfileSettingButton() {
		const ProfileSettingButton = createButton("profile-setting", "bg-orange-300 bg-opacity-10 hover:bg-orange-400 hover:bg-opacity-50 text-emerald-600 font-bold h-full w-[50%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-6xl", "Profile Setting");
		ProfileSettingButton.addEventListener('click', async(e) => {
			this.statePage = 1;
			await renderProfileSetting(this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [ProfileSettingButton]);
	}

	/*********************************************function for creating Profile Setting**********************************************/
	private async renderProfileSetting(): Promise<void> {
		// this.SettingText.textContent = "Profile Settings";
		this.ButtonDiv.classList.add('hidden');

		this.ReturnDiv.classList.remove('hidden');
	}

	/*********************************************function utils**********************************************/
	private async createReturnDiv() {
		this.ReturnDiv = createDiv("return", "grid grid-cols-2 items-center justify-between bg-transparent space-x-4 hidden");
		
		this.createReturnBtn();
		this.createSaveBtn();
		this.Background.appendChild(this.ReturnDiv);
		this.manageReturnEvent();
	}

	private createReturnBtn() {
		const ReturnButton: HTMLButtonElement = createButton("return", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full h-full", "return");

		this.ReturnDiv.appendChild(ReturnButton);
	}

	private createSaveBtn() {
		const DoneButton: HTMLButtonElement = createButton("done", "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-xl transition-colors shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full h-full", "Done");

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
			console.log("change the assets");
			await this.Done();
		})
	}

	private async Return(): Promise<void> {
		// this.SettingText.textContent = "Settings";
		Array.from(this.SettingDiv.children).forEach((child, index)=>{
			child.remove();
		})
		this.ButtonDiv.classList.remove('hidden');
		this.ReturnDiv.classList.add('hidden');
	}

	private async Done(): Promise<void> {
		if (this.statePage == PageState.GAME) {
			let CurrentAvatarAsset: number = getAvatarAsset();
			let CurrentNpcAsset: number = getCurrentNpcAsset();
			try {
				console.log("change the assets " ,CurrentAvatarAsset);
				const reqAvatar = await changeCharacterAsset(CurrentAvatarAsset);
				if (reqAvatar.ok) {
					alert("change avatar " + CurrentAvatarAsset)
				}

			} catch (error) {
				alert(error);
			}
			try {
				const reqNpc = await changeNpcAsset(CurrentNpcAsset)
				if (reqNpc.ok) {
					alert("change NPC " + CurrentNpcAsset);
				}
			} catch (error) {
				alert(error);
			}
		}
		this.Return();
		return ;
	}
}