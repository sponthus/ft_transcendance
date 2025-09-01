import { navigate } from '../../core/router.js';
import { checkLog } from "../../api/check-log.js";
import { getUserInfo, modifyUserAvatar , modifyUserInfo } from "../../api/user.js";
import { uploadAvatar } from "../../api/avatar.js";
import { BasePage } from "../BasePage.js";
import { State } from '../../core/state.js';
import { popUp } from '../../Utils/popUp.js';
import { sleep } from '../../babylon/displaying/dialogueBox.js';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage, createInput} from '../../Utils/elementMaker.js';
import { getAllGames } from '../../api/game.js';
import { DisplayHistoryPage } from './HistoryPage.js';
import { UserBanner } from './UserBannerPage.js';

enum BodyState {PROFILE = 0, FRIENDS = 1, HISTORY = 2};
const state = State.getInstance();

export class UserPage extends BasePage {
	protected slug?: string;

	private Background!: HTMLElement;
	private UserBanner!: UserBanner;
	protected BodyDiv!: HTMLElement;

	private UserData?: any;

	private StateBody!: number;


	constructor(slug: string) {
		if (!state.isLoggedIn())
			navigate('/');
		super();
		console.log('Constructor');
		this.slug = state!.user?.slug;
	}
	
	async render(): Promise<void> {
		await this.renderBanner();
		await this.initDivs();
		this.TryGetUserInfo();
		
	}

	/*************************************Functions for render Page*************************************/
	private async initDivs() {
		/*********init Divs**************/
		this.Background = this.initBackground();
		this.Background.className = "flex flex-col items-center justify-start h-screen min-h-[540px] w-screen min-w-[960px] flex-none";
	}
	
	private async TryGetUserInfo() {
		try {
			const req = await getUserInfo(this.slug!);
			if (req.ok) {
				this.UserData = req.user;
				this.UserBanner = new UserBanner(this.UserData);
				console.log(`user data = ` + JSON.stringify(this.UserData));
				this.StateBody = this.UserBanner._ProfileState;
				await this.showUserPage();
			}
			else {
				alert('Error While loading Profile' + req.error);
				navigate('/');
			}
		}
		catch (error) {
			alert(error);
		}
	}

	async showUserPage() {
		await this.renderProfileBanner();
		await this.renderBodyProfile();
		await this.addInApp();
		await this.addEvents();
	}


	private async renderProfileBanner() {
		this.UserBanner.render();
		this.Background.appendChild(this.UserBanner._ProfileBanner);
	}

	private async renderBodyProfile() {
		/***************************body div***********************/
		if (this.Background && this.BodyDiv)
			this.Background.removeChild(this.BodyDiv);

		this.BodyDiv = document.createElement('div');
		this.BodyDiv.className = "bg-orange-300  bg-opacity-50 w-full h-[60%] flex items-center justify-center overflow-auto";

		switch(this.StateBody){
			case BodyState.PROFILE:
				this.BodyDiv.textContent = "i'm in the profile body";
				break;
			case BodyState.FRIENDS:
				this.BodyDiv.textContent = "i'm in the Friendlist body";
				break;
			case BodyState.HISTORY:
				DisplayHistoryPage(this.BodyDiv);
				break;
			default:break;
		}
	
		if (this.Background)
			this.Background.appendChild(this.BodyDiv);
	}

	/*************************************Functions for Event Management*************************************/
	private async addEvents() {
		await this.BannerEvents();
		await this.editingEvents()
	}

	private async BannerEvents() {
		this.UserBanner.botBannerEvents();
		document.addEventListener('click', () => {
			if (this.StateBody != this.UserBanner._ProfileState) {
				this.StateBody = this.UserBanner._ProfileState;
				this.renderBodyProfile();
			}
		})
	}

	private async editingEvents() {
		this.UserBanner._EditProfile.editEvents();
	}

	private async addInApp() {
		if (this.Background) 
			this.app.appendChild(this.Background);
	}
}
