import { addFriend, removeFriend } from '../../api/user-service/menu/friendsList/friendRequest.js';
import { acceptRequest, rejectRequest } from '../../api/user-service/menu/friendsList/requestHandlers.js';
import { createDiv, createElement, createButton, append, createImage} from '../../Utils/elementMaker.js';
import { EditProfile } from './EditProfile.js';
import { UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { ErrorPopup } from '../ErrorPage.js';
import { currentPage } from '../../core/router.js';
import { ChangeStateBody, StateBody } from './UserPage.js';

export class UserBanner {
	private ProfileBanner!: HTMLElement;
	private UserData: UserInfo;
	private isOwnProfile!: boolean;
	private EditProfile: EditProfile;
	private statue: string;

	constructor(UserData: UserInfo, isOwnProfile: boolean, statue: string) {
		this.UserData = UserData;
		this.isOwnProfile = isOwnProfile;
		this.statue = statue;
		this.ProfileBanner = createDiv('profile-banner', "flex flex-col w-full h-[40%]");
		this.EditProfile = new EditProfile(this.UserData);
	}

	async render() {
		this.createProfileHighBanner();
		this.createProfileBotBanner();
	}
	/*************************************Functions for creating Profile Banner*************************************/
	private createProfileHighBanner() {
		const HighBanner: HTMLElement = createDiv("HighBanner", "flex w-full h-[80%] justify-between p-4 bg-sky-400 bg-opacity-50 shadow-md");
		append(HighBanner, [(this.setUserInfo() as HTMLElement)]);
		if (!this.isOwnProfile) 
			append(HighBanner, [this.setButtonUserProfile()!]);
		append(this.ProfileBanner, [HighBanner]);
	}

	private createProfileBotBanner() {
		append(this.ProfileBanner, [this.setButtonsBanner()]);
	}

	private setUserInfo(): HTMLElement {
		const UserInfo: HTMLElement = createDiv("user-info", 'flex items-end text-sm h-full w-[20%]');
		append(UserInfo, [(this.setAvatar() as HTMLElement), (this.setTexUser() as HTMLElement)])
	
		return UserInfo;
	}

	/*************************************Functions for creating Profile highBanner*************************************/
	private setTexUser(): HTMLElement {
		const UserTextDiv: HTMLElement = createDiv("user-text", "flex flex-col justify-end w-[60%] text-left p-4 text-emerald-600  translate-y-[25%] space-x-4 space-y-4");
		let userNameStr: string = "undifined";
		if (this.UserData)
			userNameStr = this.UserData.username;
		const userNameDiv: HTMLElement = createDiv("user-text", "flex items-center justify-between space-x-4");
		append(userNameDiv, [(createElement('h1', 'user-name', userNameStr, "text-2xl font-bold text-emerald-700" ) as HTMLElement)]);

		const ActionDiv: HTMLElement = createDiv("avatar-action", "");
		if (this.isOwnProfile) {
			append(ActionDiv, [(createButton('edit-profile', "text-emerald-600 hover:font-bold border-2 border-sky-500 hover:border-sky-600 rounded-lg w-32 ", "Edit profile") as HTMLButtonElement)])
			this.EditProfile.render(userNameDiv, "edit-username")
		}
		UserTextDiv.appendChild(userNameDiv);
		if (this.isOwnProfile)
			UserTextDiv.appendChild(ActionDiv);
		append(UserTextDiv, [(createElement('h1', 'user-name', this.statue , "w-32 font-bold text-emerald-700" ) as HTMLElement)]);
		return UserTextDiv;
	}

	private setAvatar(): HTMLElement {
		const AvatarDiv: HTMLElement =  createDiv('Avatar', "flex items-center h-full aspect-square translate-y-[30%] space-x-4");
	
		const AvatarCircle: HTMLElement = createDiv('AvatarCircle',"h-full aspect-square flex items-center justify-center bg-orange-300 rounded-full" );
		if (this.UserData) {
			const avatar: string = this.UserData.avatar;
			const srcImg: string = `https://${window.location.hostname}:4443/uploads/${avatar}`;
			append(AvatarCircle, [(createImage("user", "w-[95%] h-[95%] rounded-full object-cover object-center", `${srcImg}?t=${Date.now()}`) as HTMLImageElement)])
		}
		append(AvatarDiv, [AvatarCircle]);
		if (this.isOwnProfile) 
			this.EditProfile.render(AvatarDiv, "edit-avatar");
		
		return AvatarDiv;
	}

	private setButtonUserProfile() : HTMLElement | null{
		if (this.UserData.friendship_status === "none")
			return (createButton('friend-request', "self-end text-emerald-600 hover:font-bold border-2 border-sky-500 hover:border-sky-600 rounded-lg p-4 h-[20%]", "friend request") as HTMLElement);
		else if (this.UserData.friendship_status === "request_sent")
			return (createButton('request-sent', "self-end text-emerald-600 border-2 border-sky-500 rounded-lg p-4 h-[20%]", "friend request sent...") as HTMLElement);
		else if (this.UserData.friendship_status === "request_received")
			return this.addAcceptAndDeclineBtn();
		else if (this.UserData.friendship_status === "friends")
			return (createButton('remove-friend', "self-end text-emerald-600 hover:font-bold border-2 border-sky-500 hover:border-sky-600 rounded-lg p-4 h-[20%]", "remove friend") as HTMLElement);
		return null;
	}

	private addAcceptAndDeclineBtn(): HTMLElement {
		const btnDiv = createDiv(`btn-invitation`, 'self-end flex items-center h-[20%] justify-between space-x-8') as HTMLElement;

		let accept: HTMLButtonElement= (createButton(`accept`, 'px-4 text-orange-100 bg-emerald-600 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-emerald-700 transition-all 	duration-200', 'accept') as HTMLButtonElement);
		let decline: HTMLButtonElement = (createButton(`decline`, 'px-4 text-orange-100 bg-red-500 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-red-600 transition-all duration-200', 	'decline') as HTMLButtonElement);
		append(btnDiv, [accept, decline]);
		return btnDiv;
	}

	/*************************************Functions for creating Profile botBanner*************************************/
	private  setButtonsBanner() : HTMLElement {
		const BotBanner: HTMLElement = createDiv('BotBanner', "flex items-center justify-center bg-sky-500 bg-opacity-50 shadow-md w-full h-[20%] font-sans");
		append(BotBanner, [(createButton("FriendList", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl", "Friends") as HTMLButtonElement)
							,(createButton("History", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl", "History") as HTMLButtonElement)
							,(createButton("Tournament", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 font-bold text-center text-2xl", "Tournament") as HTMLButtonElement)]);
		return BotBanner; 
	}

	async botBannerEvents() {
		const Tournament = document.getElementById("Tournament-btn") as HTMLButtonElement;
		const Friends = document.getElementById("FriendList-btn") as HTMLButtonElement;
		const History = document.getElementById("History-btn") as HTMLButtonElement;
		
		let TabContent: HTMLButtonElement[] = [];
		if (Tournament && Friends && History)
			TabContent = [Friends, History, Tournament];
		this.activateButton(TabContent[StateBody]);

		TabContent.forEach(btn => {
			if (btn) {
				btn.addEventListener('click', () =>{
					TabContent.forEach(button => {this.desactivateButton(button);});
					this.activateButton(btn);
					ChangeStateBody(TabContent.indexOf(btn));})
			}
		})
	}

	async managefriendrequest() {
		const btn: HTMLButtonElement = (document.getElementById('friend-request-btn') as HTMLButtonElement);
		if (btn) {
			btn.addEventListener('click', async() => {
				try {
					const req = await addFriend(this.UserData.slug);
					if (req.ok) {
						if (currentPage) 
							currentPage.render();
					}
					else
						throw new Error(req.error);
				} catch (error) {
					await ErrorPopup(error as string);
				}
			});
		}
		const btn1: HTMLButtonElement = (document.getElementById('remove-friend-btn') as HTMLButtonElement);
		if (btn1) {
			btn1.addEventListener('click', async() => {
				try {
					const req = await removeFriend(this.UserData.slug);
					if (req.ok) {
						if (currentPage) 
							currentPage.render();
					}
					else
						throw new Error(req.error);
				} catch (error) {
					await ErrorPopup(error as string);
				}
			});
		}
		const btn2: HTMLButtonElement = (document.getElementById('accept-btn') as HTMLButtonElement);
		if (btn2) {
			btn2.addEventListener('click', async() => {
				try {
					const req = await acceptRequest(this.UserData.username);
					if (req.ok) {
						if (currentPage)
							currentPage.render();
					}
					else
						throw new Error(req.error);
				} catch(error) {
					await ErrorPopup(error as string);
				}
			});
		}
		const btn3: HTMLButtonElement = (document.getElementById('decline-btn') as HTMLButtonElement);
		if (btn3) {
			btn3.addEventListener('click', async() => {
				try {
					const req = await rejectRequest(this.UserData.username);
					if (req.ok) {
						if (currentPage)
							currentPage.render();
					}
					else
						throw new Error(req.error);
				} catch(error) {
					await ErrorPopup(error as string);
				}
			}))
		}
	}

	private activateButton(btn: HTMLButtonElement) {
		btn.classList.remove("text-emerald-600");
		btn.classList.add("text-emerald-700");
		btn.classList.add("font-bold")
	}

	private desactivateButton(btn: HTMLButtonElement) {
		btn.classList.remove("text-emerald-700");
		btn.classList.remove("font-bold");
		btn.classList.add("text-emerald-600");
	}

	get _ProfileBanner(): HTMLElement {
		return this.ProfileBanner;
	}

	get _EditProfile(): EditProfile {
		return this.EditProfile;
	}
}