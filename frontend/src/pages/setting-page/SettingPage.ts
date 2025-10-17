import { navigate } from "../../core/router";
import { BasePage } from "../BasePage";
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage, setbackgroundImages} from '../../Utils/elementMaker.js';
import { renderGameSetting, getAvatarAsset, getCurrentNpcAsset } from "./GameSettings";
import { cleanForm, renderProfileSetting, saveUserForm } from "./ProfileSetting";
import { changeNpcAsset } from "../../api/user-service/menu/npcAsset";
import { changeCharacterAsset } from "../../api/user-service/menu/characterAsset";
import { ErrorPopup } from '../ErrorPage.js';

enum PageState {GAME = 0, PROFILE = 1};

export class SettingPage extends BasePage {

	private front!: HTMLElement;
	private ButtonDiv!: HTMLElement;
	private SettingDiv!: HTMLElement;
	private Background!: HTMLElement;

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
			this.Background.className = "flex flex-col items-center justify-center h-screen w-screen";
			this.createFrontSettting();
			this.createButtonDiv();

			this.Background.appendChild(this.front);

			this.app.appendChild(this.Background);
	}

	private createFrontSettting() {
		this.front = createDiv("grid-Setting-front", "flex flex-wrap items-center justify-center w-full h-[95%] text-center space-y-4");
	}

	private createButtonDiv() {
		this.ButtonDiv = createDiv("Button_setting", "h-full w-full space-x-16 transition-all duration-300");
		append(this.front, [this.ButtonDiv]);
	}

	private async createSettingDiv() {
		this.SettingDiv = createDiv("setting", "flex flex-col items-center justifty-center space-y-4 p-24 hidden opacity-0 transition-all duration-300");
		append(this.front, [this.SettingDiv]);
	}

	private async renderHomeSetting(): Promise<void> {
		this.createGameSettingButton();
		this.createProfileSettingButton();
	}

	private createGameSettingButton() {
		const gameSettingButton = createButton("Game-Setting", "bg-orange-300 bg-opacity-10 text-orange-200 font-bold h-full w-[40%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-6xl", "Game-Setting");
		setbackgroundImages(gameSettingButton, "url('game_ui/setting/SettingPan.png')");
		gameSettingButton.addEventListener('click', async(e) => {
			this.statePage = 0;
			await renderGameSetting(this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [gameSettingButton]);
	}

	private createProfileSettingButton() {
		const ProfileSettingButton = createButton("profile-setting", "bg-orange-300 bg-opacity-10 text-orange-200 font-bold h-full w-[40%] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-6xl", "Profile Setting");
		setbackgroundImages(ProfileSettingButton, "url('game_ui/setting/SettingPan.png')");
		ProfileSettingButton.addEventListener('click', async(e) => {
			this.statePage = 1;
			await renderProfileSetting(this.ButtonDiv, this.SettingDiv, this.ReturnDiv);
		});
		append(this.ButtonDiv, [ProfileSettingButton]);
	}

	/*********************************************function utils**********************************************/
	private async createReturnDiv() {
		this.ReturnDiv = createDiv("return", "flex items-center justify-around bg-transparent space-x-4 h-[10%] w-full hidden text-4xl -translate-y-24");

		this.createReturnBtn();
		this.createSaveBtn();
		this.Background.appendChild(this.ReturnDiv);
		this.manageReturnEvent();
	}

	private createReturnBtn() {
		const ReturnButton: HTMLButtonElement = createButton("return", "transition-all duration-200 transform hover:scale-105 w-[15%] h-full", " ");
		setbackgroundImages(ReturnButton, "url('/game_ui/Backbtn.png')");
		this.ReturnDiv.appendChild(ReturnButton);
	}

	private createSaveBtn() {
		const DoneButton: HTMLButtonElement = createButton("done", "transition-all duration-200 transform hover:scale-105 w-[15%] h-full", " ");
		setbackgroundImages(DoneButton, "url('/game_ui/saveBtn.png')")
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
			await this.Done();
		})
	}

	private async Return(): Promise<void> {
		if (this.statePage === PageState.PROFILE){
			this.SettingDiv.classList.add('translate-x-96');
			cleanForm();
		}
		else
			this.SettingDiv.classList.add('-translate-x-96');
		this.SettingDiv.classList.add('opacity-0');
		setTimeout(async() => {
			this.ReturnDiv.classList.add('hidden');
			await this.displayButtonDiv();
			await this.cleanSettingdiv();
		},300);
	}

	private async displayButtonDiv() {
		this.ButtonDiv.classList.remove('hidden');
		setTimeout(async() => {
			this.ButtonDiv.classList.remove('opacity-0');
			if (this.statePage === PageState.PROFILE) {
				this.SettingDiv.classList.remove('translate-x-96');
				this.ButtonDiv.classList.remove('-translate-x-96');
			}
			else {
				this.SettingDiv.classList.remove('-translate-x-96');
				this.ButtonDiv.classList.remove('translate-x-96');
			}
		},100);
	}

	private async cleanSettingdiv() {
		Array.from(this.SettingDiv.children).forEach((child, index)=>{
			child.remove();
		})
		this.SettingDiv.classList.add('hidden');
	}

	private async Done(): Promise<void> {
		if (this.statePage == PageState.GAME) {
			await this.callApiForChangeAvatar();
			await this.CallApiForChangeNpc();
		}
		else if (this.statePage == PageState.PROFILE)
			await saveUserForm();
		this.Return();
		return ;
	}

	private async CallApiForChangeNpc() {
			let CurrentNpcAsset: number = getCurrentNpcAsset();

		try {
			const reqNpc = await changeNpcAsset(CurrentNpcAsset)
			if (reqNpc.ok)
				return ;
		} catch (error) {
			await ErrorPopup(error as string);
		}
	}

	private async callApiForChangeAvatar() {
		let CurrentAvatarAsset: number = getAvatarAsset();
		try {
			const reqAvatar = await changeCharacterAsset(CurrentAvatarAsset);
			if (reqAvatar.ok)
				return ;
 
		} catch (error) {
			await ErrorPopup(error as string);
		}
	}
}