import { checkLog } from "../api/user-service/connection/check-log.js";
import  {modifyUserAvatar } from "../api/user-service/user.js";
import { getUserInfo } from '../api/user-service/user-info/getUserInfo.js';
import { navigate } from '../core/router.js';
import { uploadAvatar } from "../api/avatar.js";
import { BasePage } from "./BasePage.js";
import { popUp } from '../Utils/popUp.js';
import { sleep } from '../babylon/displaying/dialogueBox.js';
import { updateUsername } from "../api/user-service/user-info/updateUsername.js";

enum BodyState {PROFILE = 0, FRIENDS = 1, HISTORY = 2};
enum EditState {AVATAR = 0, USERNAME = 1};

export class UserPage extends BasePage {
	protected slug?: string;

	private _Background?: HTMLElement;
	private _ProfileBanner?: HTMLElement;
	// private _UserInfo?: HTMLElement;
	private _BodyDiv?: HTMLElement;

	private _UserData?: any;

	private isOwnProfile?: boolean;

	private StateBody?: number;
	private EditingState?: number;
	private isEdit?: boolean;

	private PopUp: popUp;

	constructor(slug: string) {
		super();
		console.log('Constructor');
		this.slug = state!.user?.slug;
		this.PopUp = new popUp("");
	}
	
	async render(): Promise<void> {
		await this.renderBanner();
		console.log('getUserPage', this.slug);
		await this.initDivs();
		this.isEdit = false;

		// this.app.innerHTML = `<h1>Loading user page...</h1>`;
		// console.log("Loading user page with username = " + this.slug);
		
		const res = await checkLog();
		if (!res.ok) {
		    this.app.innerHTML = `
		        <h1></h1>
		        <h1>Not logged in, no access allowed</h1>
		    `;
		    return;
		}
		// const connectedUser = res.user.slug;
		
		const req = await getUserInfo();
		if (req.ok) {
			this._UserData = req.userInfo;
			console.log(`user data = ` + JSON.stringify(this._UserData));
			this.isOwnProfile = true;// = this.slug === connectedUser;
			this.StateBody = 0;
			await this.showUserPage();
		}
		else {
			this.app.innerHTML = `
			<h1>Error while loading profile</h1>
			<button id="retry">Try again</button>
		    `;
		    console.error("error is" , req.error);
			console.log("yo the slug is ", state!.user?.slug);
		    document.getElementById('retry')?.addEventListener('click', async () => {
		        await navigate('/' + this.slug);
		    });
		}
	}

	/*************************************Functions for render Page*************************************/
	private async initDivs() {
		/*********init Divs**************/
		this._Background = this.initBackground();
		this._Background.className = "flex flex-col items-center justify-start h-screen min-h-[540px] w-screen min-w-[960px] flex-none";
		
		this._ProfileBanner = document.createElement('div');
		this._ProfileBanner.className = "flex flex-col w-full h-[40%]";
		// this._ProfileBanner.style.backgroundImage = "url('/asset/environements/Sample.png')";
		// this._ProfileBanner.style.backgroundSize = "cover";
		// this._ProfileBanner.style.backgroundPosition = "center"
	}
	
	async showUserPage() {

		await this.renderProfileBanner();
		await this.renderBodyProfile();
		await this.addInApp();
		await this.addEvents();
		/***************************end body div***********************/

		// const avatarActionDiv = document.getElementById('avatar-action');
		// if (!avatarActionDiv) {
		//     console.log('avatar action debug');
		//     this.app.innerHTML = `Error`;
		//     return;
		// }
		
		// const editAvatarBtn = document.getElementById('edit-profile-btn');
		// if (!editAvatarBtn) {
		//     console.log('editAvatarBtn debug');
		//     this.app.innerHTML = `Error`;
		//     return;
		// }
		// else
		//     editAvatarBtn.addEventListener('click', async () => this.openUploadForm(avatarActionDiv, this._UserData));
	}


	private async renderProfileBanner() {
		await this.createProfileHighBanner(); //create highbanner
		await this.createProfileBotBanner(); //create botBAnner

		if (this._Background && this._ProfileBanner)
			this._Background.appendChild(this._ProfileBanner);
	}

	private async renderBodyProfile() {
		/***************************body div***********************/
		if (this._Background && this._BodyDiv)
			this._Background.removeChild(this._BodyDiv);

		this._BodyDiv = document.createElement('div');
		this._BodyDiv.className = "bg-orange-300  bg-opacity-50 w-full h-[60%] flex items-center justify-center";

		switch(this.StateBody){
			case BodyState.PROFILE:
				this._BodyDiv.textContent = "i'm in the profile body";
				break;
			case BodyState.FRIENDS:
				this._BodyDiv.textContent = "i'm in the Friendlist body";
				break;
			case BodyState.HISTORY:
				this._BodyDiv.textContent = "i'm in the History body";
				break;
			default:break;
		}
	
		if (this._Background)
			this._Background.appendChild(this._BodyDiv);
	}


	/*************************************Functions for creating Profile Banner*************************************/
	private async createProfileHighBanner() {
		const HighBanner: HTMLElement  = document.createElement('div');
		HighBanner.className = "flex flex-col w-full h-[80%] justify-between p-4 bg-sky-400 bg-opacity-50 shadow-md h-64";

		await this.setUserInfo(HighBanner);

		if (this._ProfileBanner)
			this._ProfileBanner.appendChild(HighBanner);
	}

	private async createProfileBotBanner() {
		const BotBanner: HTMLElement = document.createElement('div');
		BotBanner.className = "flex items-center justify-center bg-sky-500 bg-opacity-50 shadow-md w-full h-[20%] font-sans";

		await this.setButtonsBanner(BotBanner);

		if (this._ProfileBanner)
			this._ProfileBanner.appendChild(BotBanner);
	}

	/*************************************Functions for creating Profile highBanner*************************************/
	private async setUserInfo(HighBanner: HTMLElement) {
		const UserInfo: HTMLElement = document.createElement('div');
		UserInfo.id = 'user-info-div';
		UserInfo.className = 'flex items-end order-1 order-1 text-sm h-full w-[20%]';

		await this.setAvatar(UserInfo);
		await this.setTexUser(UserInfo);
		//set text and edit profile
	
		HighBanner.appendChild(UserInfo);
	}

	private async setTexUser(UserInfo: HTMLElement) {
		const UserTextDiv: HTMLElement = document.createElement('div');
		UserTextDiv.className = "flex flex-col justify-end w-[60%] text-left p-4 text-emerald-600  translate-y-[25%]";
	
		const userNameDiv: HTMLElement = document.createElement('div');
		userNameDiv.className = "flex items-center space-x-4";

		const userName: HTMLElement = document.createElement('h1');
		userName.id = "user-name";
		userName.className = "text-2xl font-bold text-emerald-700";
		if (this._UserData)
			userName.textContent =  this._UserData.username;
		else
			userName.textContent = "undefined";

		userNameDiv.appendChild(userName);

		const ActionDiv: HTMLElement = document.createElement('div');
		if (this.isOwnProfile) {
			ActionDiv.id = "avatar-action";
			this.createButton(ActionDiv, "Edit profile", "edit-profile", "text-emerald-600 hover:font-bold border-2 border-sky-500 hover:border-sky-600 rounded-lg w-32");
		}

		if (this.isOwnProfile) 
			this.addEditButton(userNameDiv, "edit-username")
		UserTextDiv.appendChild(userNameDiv);
		if (this.isOwnProfile)
			UserTextDiv.appendChild(ActionDiv);

		UserInfo.appendChild(UserTextDiv);
	}

	private async setAvatar(UserInfo: HTMLElement) {
		const AvatarDiv: HTMLElement = document.createElement('div');
		AvatarDiv.className = "flex items-center h-full aspect-square translate-y-[30%]";
	
		const AvatarCircle: HTMLElement = document.createElement('div');
		AvatarCircle.className = "h-full aspect-square flex items-center justify-center bg-orange-300 rounded-full";

		if (this._UserData) {
			console.log(`user data = ` + JSON.stringify(this._UserData));
			const avatar: string = this._UserData.avatar;
			console.log("avatar in profile = ", avatar);
			const srcImg: string = `https://localhost:4443/uploads/${avatar}`; // problem firefox https autosignate certificate 
			console.log("srcImg in profile = ", srcImg);
			
			const userImg: HTMLImageElement = document.createElement('img');
			userImg.id = "user-img";
			userImg.className = "w-[95%] h-[95%] rounded-full object-cover object-center";
			userImg.src = srcImg;

			AvatarCircle.appendChild(userImg);
		}

		AvatarDiv.appendChild(AvatarCircle);
		
		UserInfo.appendChild(AvatarDiv);
		if (this.isOwnProfile) 
			this.addEditButton(UserInfo, "edit-avatar")
	}

	/*************************************Functions for creating Profile botBanner*************************************/
	private async setButtonsBanner(BotBanner: HTMLElement) {
		await this.createButton(BotBanner, "Profile", "Profile", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-700 font-bold text-center text-2xl");
		await this.createButton(BotBanner, "Friends", "FriendList", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl");
		await this.createButton(BotBanner, "History", "History", "flex items-center justify-center h-full w-1/6 hover:text-emerald-700 hover:font-bold text-emerald-600 text-center text-2xl");
	}

	/*************************************Functions for Event Management*************************************/
	private async addEvents() {
		await this.BannerEvents();
		await this.editingEvents()
	}

	private async BannerEvents() {
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
				this.renderBodyProfile()
				console.log("activ button ? = ", btn);
				console.log("state content : ", this.StateBody); })
		})
	}

	private async editingEvents() {
		const EditBtn = document.getElementById("edit-profile-btn") as HTMLButtonElement;
		if (!EditBtn) {
			console.log("canno't find editing button")
			return ;
		}
		const EditUsername = document.getElementById("edit-username-btn") as HTMLButtonElement;
		const EditAvatar = document.getElementById("edit-avatar-btn") as HTMLButtonElement;
		
		const TabContent: HTMLButtonElement[] = [EditAvatar, EditUsername];

		this.setEdintingMod(EditBtn, TabContent);
		this.EditiongProfile(TabContent);
	}

	/*************************************Functions utils for edition*************************************/
	private setEdintingMod(EditBtn: HTMLButtonElement, TabContent:  HTMLButtonElement[]) {
		if (this.isEdit == false) {
			EditBtn.addEventListener('click', () => {
				if (this.isEdit == false) {
					TabContent.forEach(btn => {btn?.classList.remove('hidden');})
					this.isEdit = true;
					EditBtn.textContent = "Cancel Edition";
				}
				else {
					TabContent.forEach(btn => {btn?.classList.add('hidden');})
					this.isEdit = false;
					EditBtn.textContent = "Edit Profile";
				}
				console.log('is editiong Mod ? ', this.isEdit);
			})
		}
	}

	private EditiongProfile(TabContent:  HTMLButtonElement[]) {
		TabContent.forEach(btn => {
			btn.addEventListener('click', () => {
				this.EditingState = TabContent.indexOf(btn);
				switch(this.EditingState) {
					case EditState.AVATAR:
						this.renderUserAvatarPopUp();
						console.log("Editing Avatar");
						this.editUserInfoEvent();
						break;
					case EditState.USERNAME:
						console.log("editing username");
						this.renderUsernamePopUp();
						this.editUserInfoEvent();
						break;
					default:break;
				}
			})
		})
	}
	/*************************************Functions utils for Avatar edition*************************************/
	private renderUserAvatarPopUp() {
		this.PopUp.changeTitleText("Edit Profile Pic");
		this.PopUp.changeTitleClass('text-emerald-600 font-bold border-2 border-orange-200 rounded-xl w-full text-center');
		this.PopUp.changeBodyClass('flex flex-col items-center justify-center rounded-xl shadow-xl p-6 w-[20%] space-y-4 bg-orange-300 ');
	
		const BtnDiv = document.createElement('div') as HTMLElement;
		BtnDiv.className = "flex items-center justify-center space-x-4 w-full";
		this.createButton(BtnDiv, "Cancel", "Cancel", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl");
		this.createButton(BtnDiv, "Save", "Save", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl");

		const Form = document.createElement('form');
		Form.id = "avatar-upload-form";
		Form.className = "space-y-6 ";
		Form.enctype = "multipart/form-data";

		const Input: HTMLInputElement = document.createElement('input');
		Input.className = "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600";
		Input.type = "file";
		Input.name = "avatar";
		Input.accept = "image/*" ;
		Input.required = true;

		Form.appendChild(Input);

		// this.createButton(Form, "Upload", "Upload", "");

		this.PopUp.appendToBody(Form);
		this.PopUp.appendToBody(BtnDiv);
		this.PopUp.addOverlayToWindow();
	}

	/*************************************Functions utils for username edition*************************************/
	private renderUsernamePopUp() {
		this.PopUp.changeTitleText("Edit Username");
		this.PopUp.changeTitleClass('text-emerald-600 font-bold border-2 border-orange-200 rounded-xl w-full text-center');
		this.PopUp.changeBodyClass('flex flex-col items-center justify-center rounded-xl shadow-xl p-6 w-[20%] space-y-4 bg-orange-300 ');
	
		const Form = document.createElement('form');
		Form.id = "Edit-form";
		Form.className = "space-y-6";

		const UserNameForm = this.createForm("text", "username", "choose a new username", "edit your username");
		Form.appendChild(UserNameForm);

		const BtnDiv = document.createElement('div') as HTMLElement;
		BtnDiv.className = "flex items-center justify-center space-x-4 w-full";
		this.createButton(BtnDiv, "Cancel", "Cancel", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl");
		this.createButton(BtnDiv, "Save", "Save", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl");
	
		this.PopUp.appendToBody(Form);
		this.PopUp.appendToBody(BtnDiv);
		this.PopUp.addOverlayToWindow();
	}

	private async saveUsername() {
		const Form = document.getElementById('Edit-form');
		
		const username: string = (Form?.querySelector('input[name="username"]') as HTMLInputElement).value;

		if (username == this._UserData.username) {
			return ;
		}

		//const req = await modifyUserInfo(this._UserData.slug, username);
		const req = await updateUsername(username);
		if (req.ok) {
			console.log("Username edited successfully");
			this.PopUp.cleanBody(); // c'est quoi ?
			this.updateUserData();
			navigate(`/user/${this._UserData.slug}`);
			location.reload();
		}
		else
			alert(req.error);
	}

	private async saveDataUser() {
		await this.saveUsername();
		this.openUploadForm();
	}

		async openUploadForm() {

		const form = document.getElementById('avatar-upload-form') as HTMLFormElement;
		if (!form)
			return ;

		const input = form.querySelector('input[type="file"]') as HTMLInputElement;
		if (!input.files || input.files.length === 0) {
		    alert("Please, select a file");
		    return;
		    }
			
		const file = input.files[0];
		
		const formData = new FormData();
		formData.append('avatar', file);
		console.log(`sending file: ${file}`);
		
		// Makes 2 requests : upload to upload service + change avatar in user db
		const req = await uploadAvatar(this._UserData.slug, formData);
		if (req.ok) {
		    alert("Avatar updated successfully!");
		    const pathReq = await modifyUserAvatar(this._UserData.slug, req.avatar);
		    if (pathReq.ok) {
		        await navigate(`/user/${this._UserData.slug}`);
		        return ;
		    }
		    else {
		        alert("Error while uploading avatar path in db" + (pathReq.error || "Unknown error"));
		    }
		}
		else {
		    alert("Upload failed: " + (req.error || "Unknown error"));
		}
	}
	/*************************************Functions utils*************************************/
	private createEditLogo(): SVGSVGElement  {
		const logoSvg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		logoSvg.setAttribute("class", "h-6 aspect-square translate-x-[15%]  ");
		logoSvg.setAttribute("fill", "none");
		logoSvg.setAttribute("stroke", "currentColor");
		logoSvg.setAttribute("viewBox", "0 0 24 24");

		const logoPath: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg" ,'path');
		logoPath.setAttribute("stroke-linecap", "round");
		logoPath.setAttribute("stroke-linejoin", "round");
		logoPath.setAttribute("stroke-width", "2");
		logoPath.setAttribute("d", "M15.232 5.232l3.536 3.536m-2.036-1.5L6 18l-4 1 1-4 10.732-10.732a1.5 1.5 0 012.121 0z");

		logoSvg.appendChild(logoPath);

		return logoSvg;
	}

	private addEditButton(div: HTMLElement, Id: string) {
			const logoSvg = this.createEditLogo() as SVGSVGElement;

			this.createButton(div, "", Id , "flex items-center justify-center aspect-square border-2 text-emerald-500 border-sky-500 hover:border-sky-600 hover:text-emerald-600 rounded-lg  translate-y-[25%] hidden");

			const EditButton = div.querySelector(`#${Id}-btn`) as HTMLButtonElement;
			if (EditButton)
				console.log("there is a button for edit");
			EditButton.appendChild(logoSvg);
	}

	private async createButton(Parent: HTMLElement, TextContent: string, Id: string, className: string) {
		const Button: HTMLButtonElement = document.createElement('button');
		Button.id = Id + "-btn";
		Button.className = className;
		Button.textContent = TextContent;

		Parent.appendChild(Button);
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

	private async updateUserData(){
		//const req = await getUserInfo(this.slug!);
		const req = await getUserInfo();
		if (req.ok) {
			this._UserData = req.userInfo;
			console.log(`user data = ` + JSON.stringify(this._UserData));
		}
	}

	private async addInApp() {
		if (this._Background) 
			this.app.appendChild(this._Background);
	}

	private createForm(type: string, name: string, placeHolder: string, texteContent:string): HTMLElement {
		const Div: HTMLElement = document.createElement('div');

		const Label: HTMLLabelElement = document.createElement('label');
		Label.htmlFor = name;
		Label.className = "block text-sm font-medium text-emerald-600 mb-2";

		const Input: HTMLInputElement = document.createElement('input');
		Input.className = "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600";
		Input.type = type;
		Input.name = name;
		Input.id = name;
		Input.placeholder = placeHolder;
		Input.required = true;

		const Text: HTMLElement = document.createElement('p');
		Text.textContent = texteContent;
		Text.className = "block text-sm  text-center font-medium text-emerald-500 mb-2";
		

		Div.appendChild(Text);
		Div.appendChild(Label);
		Div.appendChild(Input);
	
		return Div;
	}


	/*************************************Functions utils for Popup Event*************************************/
	private editUserInfoEvent() {
		const SaveBtn = document.getElementById("Save-btn") as HTMLButtonElement;
		const CancelBtn = document.getElementById("Cancel-btn") as HTMLButtonElement;
		
		const TabContent: HTMLButtonElement[] = [CancelBtn, SaveBtn];
		
		console.log("user data in save user :", this._UserData);
		TabContent.forEach(btn => {
			console.log("click Cancel or Return");
			btn.addEventListener('click', () =>{
				switch(TabContent.indexOf(btn)) {
					case 0:
						break;
					case 1:
						this.saveDataUser();
						break;
					default:break;
				}
				this.PopUp.cleanBody();
				this.PopUp.removeOverlayToWindow();
			})
		})
	}
}
