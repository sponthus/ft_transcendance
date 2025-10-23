import { navigate } from '../../core/router.js';
import { getUserInfo, getUserInfoBySlug, UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { BasePage } from "../BasePage.js";
import { DisplayHistoryPage } from './HistoryPage.js';
import { displayFriendlist } from './FriendListPage.js';
import { UserBanner } from './UserBannerPage.js';
import { DisplayeTournamentHistoryPage } from './TournamentHistoryPage.js';
import { ErrorPopup } from '../ErrorPage.js';
import { getUserStatus } from '../../api/session-service/getStatus.js';
import { cleanBanner } from '../Banner.js';

export enum BodyState {FRIENDS = 0, HISTORY = 1, TOURNAMENT = 2};
export let StateBody: number = BodyState.FRIENDS;;
let isChangeBody: Boolean;

export function ChangeStateBody(state: number){
	if (state != StateBody) {
		isChangeBody = true;
		StateBody = state;
	}
}

export class UserPage extends BasePage {
	private Background!: HTMLElement;
	private UserBanner!: UserBanner;
	private slug!: string;
	protected BodyDiv!: HTMLElement;

	private UserData?: UserInfo | null = null;

	private isOwnProfile: boolean = true;

	private Statue: string; 

	constructor(slug: string) {
		super();
		this.slug = slug;
		this.Statue = 'Error';
	}
	
	async render(): Promise<void> {
		this.destroy();
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
				if (this.UserData) {
					const request = await getUserStatus(this.UserData.slug);
					if (!request.ok)
						throw new Error(request.error);
					else {
						if (request.status && request.status.status === "online")
							this.Statue = 'online 🟢​';
						if (request.status && request.status.status === "disconnected")
							this.Statue = 'disconnected 🔴​';
					}
					this.UserBanner = new UserBanner(this.UserData, this.isOwnProfile, this.Statue);
					await this.showUserPage();
				}
			} else {
				throw new Error("Unable to load profile " + req.error);
			}
		}
		catch (error) {
			await ErrorPopup(error as string);
			await navigate('/');
		}
	}

	private async fillUserData() {
		this.UserData = null;
		this.isOwnProfile = false;
		const req = await getUserInfoBySlug(this.slug);
		if (req.ok) {
			this.UserData = req.userInfo;
		} else if (req.error === "User not found") {
			await navigate('/');
		} else {
			throw new Error("Unable to load profile " + req.error);
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
			this.BodyDiv.remove();

		this.BodyDiv = document.createElement('div');
		this.BodyDiv.className = "bg-orange-300  bg-opacity-50 w-full h-[60%] flex items-center justify-center overflow-auto";
		switch(StateBody){
			case BodyState.TOURNAMENT:
				await DisplayeTournamentHistoryPage(this.BodyDiv, this.UserData!, this.isOwnProfile);
				break;
			case BodyState.FRIENDS:
				await displayFriendlist(this.BodyDiv, this.UserData!, this.isOwnProfile);
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
		document.addEventListener('click', this.onBodyStateChange);
	}

	private onBodyStateChange = (event: Event): void => {
		if (isChangeBody) {
			this.renderBodyProfile();
			isChangeBody = false;
		}
	}

	private async editingEvents() {
		this.UserBanner._EditProfile.editEvents();
	}

	private async addInApp() {
		if (this.Background) 
			this.app.appendChild(this.Background);
	}

	destroy(): void {
		cleanBanner();
		Array.from(this.banner.children).forEach(child => {child.remove()});
		this.banner.innerHTML = '';
        Array.from(this.app.children).forEach(child => {child.remove()});
		this.app.innerHTML = '';
		document.removeEventListener('click',  this.onBodyStateChange);
	}
}
