import { createDiv, createElement, createButton, append, createImage} from '../../Utils/elementMaker.js';
import { EditProfile } from './EditProfile.js';

enum BodyState {PROFILE = 0, FRIENDS = 1, HISTORY = 2};

export class UserBanner {
	
	private StateBody!: number;
	private ProfileBanner!: HTMLElement;
	private UserData: any;
	private isOwnProfile!: boolean;
	private EditProfile: EditProfile

	constructor(UserData: any) {
		this.UserData = UserData;
		this.isOwnProfile = true;
		this.StateBody = BodyState.PROFILE;
		this.ProfileBanner = createDiv('profile-banner', "flex flex-col w-full h-[40%]");
		this.EditProfile = new EditProfile(this.UserData);
	}

	render() {
		this.createProfileHighBanner();
		this.createProfileBotBanner();
	}
		/*************************************Functions for creating Profile Banner*************************************/
	private createProfileHighBanner() {
		const HighBanner: HTMLElement = createDiv("HighBanner", "flex flex-col w-full h-[80%] justify-between p-4 bg-sky-400 bg-opacity-50 shadow-md h-64");
		append(HighBanner, [(this.setUserInfo() as HTMLElement)]);
		append(this.ProfileBanner, [HighBanner]);
	}

	private createProfileBotBanner() {
		append(this.ProfileBanner, [this.setButtonsBanner()]);
	}
		private setUserInfo(): HTMLElement {
		const UserInfo: HTMLElement = createDiv("user-info", 'flex items-end order-1 order-1 text-sm h-full w-[20%]');
		append(UserInfo, [(this.setAvatar() as HTMLElement), (this.setTexUser() as HTMLElement)])
	
		return UserInfo;
	}

	/*************************************Functions for creating Profile highBanner*************************************/
	private setTexUser(): HTMLElement {
		const UserTextDiv: HTMLElement = createDiv("user-text", "flex flex-col justify-end w-[60%] text-left p-4 text-emerald-600  translate-y-[25%] space-x-4 space-y-4");
		let userNameStr: string = "undifined";
		if (this.UserData)
			userNameStr = this.UserData.username;
		const userNameDiv: HTMLElement = createDiv("user-text", "flex items-center space-x-4");
		append(userNameDiv, [(createElement('h1', 'user-name', userNameStr, "text-2xl font-bold text-emerald-700" ) as HTMLElement)]);

		const ActionDiv: HTMLElement = createDiv("avatar-action", ""); // document.createElement('div');
		if (this.isOwnProfile) {
			append(ActionDiv, [(createButton('edit-profile', "text-emerald-600 hover:font-bold border-2 border-sky-500 hover:border-sky-600 rounded-lg w-32", "Edit profile") as HTMLButtonElement)])
			this.EditProfile.render(userNameDiv, "edit-username")
		}
		UserTextDiv.appendChild(userNameDiv);
		if (this.isOwnProfile)
			UserTextDiv.appendChild(ActionDiv);
		return UserTextDiv;
	}

	private setAvatar(): HTMLElement {
		const AvatarDiv: HTMLElement =  createDiv('Avatar', "flex items-center h-full aspect-square translate-y-[30%] space-x-4");
	
		const AvatarCircle: HTMLElement = createDiv('AvatarCircle',"h-full aspect-square flex items-center justify-center bg-orange-300 rounded-full" );
		if (this.UserData) {
			console.log(`user data = ` + JSON.stringify(this.UserData));
			const avatar: string = this.UserData.avatar;
			console.log("avatar in profile = ", avatar);
			const srcImg: string = `https://localhost:4443/uploads/${avatar}`; // problem firefox https autosignate certificate 
			console.log("srcImg in profile = ", srcImg);
			append(AvatarCircle, [(createImage("user", "w-[95%] h-[95%] rounded-full object-cover object-center", srcImg) as HTMLImageElement)])
		}
		append(AvatarDiv, [AvatarCircle]);
		if (this.isOwnProfile) 
			this.EditProfile.render(AvatarDiv, "edit-avatar")
		
		return AvatarDiv;
	}

	/*************************************Functions for creating Profile botBanner*************************************/
	private  setButtonsBanner() : HTMLElement {
		const BotBanner: HTMLElement = createDiv('BotBanner', "flex items-center justify-center bg-sky-500 bg-opacity-50 shadow-md w-full h-[20%] font-sans");
		append(BotBanner, [(createButton("Profile", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-700 font-bold text-center text-2xl", 		"Profile") as HTMLButtonElement)
							,(createButton("FriendList", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl", "Friends") as HTMLButtonElement)
							,(createButton("History", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl", "History") as HTMLButtonElement)]);
		return BotBanner; 
	}

	async botBannerEvents() {
		const Profile = document.getElementById("Profile-btn") as HTMLButtonElement;
		const Friends = document.getElementById("FriendList-btn") as HTMLButtonElement;
		const History = document.getElementById("History-btn") as HTMLButtonElement;

		let TabContent: HTMLButtonElement[] = [];
		if (Profile && Friends && History)
			TabContent = [Profile, Friends, History];

		TabContent.forEach(btn => {
			btn.addEventListener('click', () =>{
				TabContent.forEach(button => {
					this.desactivateButton(button); });
				this.activateButton(btn);
				this.StateBody = TabContent.indexOf(btn);
				// this.renderBodyProfile()
				console.log("activ button ? = ", btn);
				console.log("state content : ", this.StateBody); })
		})
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

	get	_ProfileState() :number {
		return this.StateBody;
	}

	get _ProfileBanner(): HTMLElement {
		return this.ProfileBanner;
	}

	get _EditProfile(): EditProfile {
		return this.EditProfile;
	}
}