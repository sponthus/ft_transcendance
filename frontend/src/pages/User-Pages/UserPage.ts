import { navigate } from '../../core/router.js';
import { getUserInfo, getUserInfoBySlug, UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { BasePage } from "../BasePage.js";
import { DisplayHistoryPage } from './HistoryPage.js';
import { displayFriendlist } from './FriendListPage.js';
import { UserBanner } from './UserBannerPage.js';
import { DisplayeTournamentHistoryPage } from './TournamentHistoryPage.js';
import { ErrorPopup } from '../ErrorPage.js';
import { getUserStatus } from '../../api/session-service/getStatus.js';

enum BodyState {TOURNAMENT = 0, FRIENDS = 1, HISTORY = 2};

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

	private Statue: string; 

	constructor(slug: string) {
		super();
		this.slug = slug;
		this.Statue = ' ​';
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
				const request = await getUserStatus(this.UserData.slug);
				if (!request.ok)
					throw new Error(request.error);
				else {
					if (request.status && request.status.status === "online")
						this.Statue = 'online 🟢​';
					if (request.status && request.status.status === "disconnected")
						this.Statue = 'disconnected 🔴​';
					if (request.status && request.status.status === "playing")
						this.Statue = 'playing 🟡​​';
				}
				this.UserBanner = new UserBanner(this.UserData, this.isOwnProfile, this.Statue);
				this.StateBody = this.UserBanner._ProfileState;
				await this.showUserPage();
			} else {
				await ErrorPopup("Unable to load profile");
				navigate('/');
			}
		}
		catch (error) {
			await ErrorPopup(error as string);
			navigate('/');
		}
	}

	private async fillUserData() {
		// console.log('fill userData called');
		this.isOwnProfile = false;
		try {
			const req = await getUserInfoBySlug(this.slug);
			if (req.ok) {
				this.UserData = req.userInfo;
				// console.log("new userdata = ", this.UserData);
			} else if (req.error === "User not found") {
				throw new Error("User not found");
			} else {
				throw new Error("Unable to load profile");
			}
		} catch (error) {
			await ErrorPopup(error as string);
			navigate('/');
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
			case BodyState.TOURNAMENT:
				await DisplayeTournamentHistoryPage(this.BodyDiv, this.UserData!, this.isOwnProfile);
				break;
			case BodyState.FRIENDS:
				await displayFriendlist(this.BodyDiv,this.UserData!, this.isOwnProfile);
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
