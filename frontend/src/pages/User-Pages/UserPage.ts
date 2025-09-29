import { navigate } from '../../core/router.js';
import { updateUsername } from "../../api/user-service/user-info/updateUsername.js";
import { getUserInfo, getUserInfoBySlug, UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { uploadAvatar } from "../../api/avatar.js";
import { BasePage } from "../BasePage.js";
import { popUp } from '../../Utils/popUp.js';
import { sleep } from '../../babylon/displaying/dialogueBox.js';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage, createInput} from '../../Utils/elementMaker.js';
import { getAllGames } from '../../api/game-service/games/game.js';
import { DisplayHistoryPage } from './HistoryPage.js';
import { displayFriendlist } from './FriendListPage.js';
import { UserBanner } from './UserBannerPage.js';

enum BodyState {PROFILE = 0, FRIENDS = 1, HISTORY = 2};

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
	id: number
	username: string;
	nickname: string;
	avatar: string;
	slug: string;
	created_at: string;
};

export class UserPage extends BasePage {
	// protected slug?: string;

	private Background!: HTMLElement;
	private UserBanner!: UserBanner;
	private slug!: string;
	protected BodyDiv!: HTMLElement;

	private UserData?: UserInfo;

	private StateBody!: number;

	private isOwnProfile: boolean = true;

	constructor(slug: string) {
		// if (!state.isLoggedIn())
		// 	navigate('/');
		super();
		console.log('Constructor');
		this.slug = slug;
		// this.slug = state!.user?.slug;
	}
	
	async render(): Promise<void> {
		await this.renderBanner();
		await this.initDivs();
		await this.TryGetUserInfo();
	}

	/*************************************Functions for render Page*************************************/
	private async initDivs() {
		/*********init Divs**************/
		this.Background = this.initBackground();
		this.Background.className = "flex flex-col items-center justify-start h-screen min-h-[540px] w-screen min-w-[960px] flex-none";
	}
	
	private async TryGetUserInfo() {
		try {
			const req = await getUserInfo();
			if (req.ok) {
				this.UserData = req.userInfo;
				if (this.slug != this.UserData.slug)
					await this.fillUserData()
				this.UserBanner = new UserBanner(this.UserData, this.isOwnProfile);
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

	private async fillUserData() {
		console.log('fille userDAta called');
		this.isOwnProfile = false;
		try {
			const req = await getUserInfoBySlug(this.slug);
			if (req.ok) {
				this.UserData = req.userInfo;
				console.log("new userdata = ", this.UserData);
			}

		} catch (error) {
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
		await this.UserBanner.render();
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
				await displayFriendlist(this.BodyDiv,this.UserData!, this.isOwnProfile);
				// this.BodyDiv.textContent = "i'm in the Friendlist body";
				break;
			case BodyState.HISTORY:
				await DisplayHistoryPage(this.BodyDiv, this.UserData!);
				break;
			default:break;
		}
	
		if (this.Background)
			this.Background.appendChild(this.BodyDiv);
	}

	/*************************************Functions for Event Management*************************************/
	private async addEvents() {
		await this.BannerEvents();
		if (this.isOwnProfile)
			await this.editingEvents();
		else
			await this.UserBanner.managefriendrequest();
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
