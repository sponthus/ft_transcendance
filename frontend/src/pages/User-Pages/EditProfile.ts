import { popUp } from "../../Utils/popUp";
import { createDiv, createElement, createButton, createFormDiv, append, createInput} from '../../Utils/elementMaker.js';
import { updateUsername } from "../../api/user-service/user-info/updateUsername.js";
import { getUserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { uploadAvatar } from "../../api/avatar.js";
import { currentPage, navigate } from '../../core/router.js';
import { ErrorPopup } from '../ErrorPage.js';
import { updateAvatar } from "../../api/user-service/user-info/modifyUserAvatar.js";
import { UserPage } from "./UserPage";
import { SettingPage } from "../setting-page/SettingPage";

enum EditState {AVATAR = 0, USERNAME = 1};

export class EditProfile extends popUp {

	// protected slug?: string;

	private BtnDiv!: HTMLElement
	private EditingState!: number;
	private isEdit!: boolean;
	private UserData?: any;

	constructor(UserData: any) {
		super("");
		this.changeTitleClass('text-emerald-600 font-bold border-2 border-orange-200 rounded-xl w-full text-center');
		this.changeBodyClass('flex flex-col items-center justify-center rounded-xl shadow-xl p-6 w-[20%] space-y-4 bg-orange-300 ');
		this.createReturnAndSaveBtn();
		this.isEdit = false;
		this.UserData = UserData;
	}

	render(div: HTMLElement, Id: string) {
		this.addEditButton(div, Id);
	}

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
			append(div, [(createButton(Id, "flex items-center justify-center aspect-square border-2 text-emerald-500 border-sky-500 hover:border-sky-600 hover:text-emerald-600 rounded-lg translate-y-[25%] hidden", "") as HTMLElement)]);
			(div.querySelector(`#${Id}-btn`) as HTMLButtonElement)?.appendChild(logoSvg)
	}

		/*************************************Functions utils for Avatar edition*************************************/
	private renderUserPopUp(Title: string) {
		this.changeTitleText(Title);

		let Form: HTMLFormElement;
		switch (this.EditingState) {
			case (EditState.AVATAR) :
				Form = this.CreateProfilePicForm();
				this.appendsToBody([Form, this.BtnDiv]);
				break;
			case (EditState.USERNAME) :
				Form =  this.CreateUsernameForm();
				this.appendsToBody([Form, this.BtnDiv]);
				break;
			default:break;
		}
		this.addOverlayToWindow();
	}

	private createReturnAndSaveBtn() {
	this.BtnDiv = createDiv('btn/',  "flex items-center justify-center space-x-4 w-full");
		append(this.BtnDiv, [createButton("Cancel", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl", "Cancel")
						, createButton("Save", "text-center bg-orange-200 hover:bg-orange-400 text-emerald-600 hover:font-bold w-[50%] rounded-xl", "Save")]);
	}

	private CreateUsernameForm() : HTMLFormElement {
		const Form: HTMLFormElement = createElement("form", "Edit", "", "space-y-6") as HTMLFormElement;

		const UserNameForm: HTMLElement = createFormDiv(["text", "", "choose a new username", true], "username", "edit your username", [""
																												, "block text-sm font-medium text-emerald-600 mb-2"
																												, "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600"
																												, "block text-sm  text-center font-medium text-emerald-500 mb-2"]);
		append(Form, [UserNameForm])
		
		return Form;
	}
	
	private CreateProfilePicForm() : HTMLFormElement {
		const Form: HTMLFormElement = createElement('form', "avatar-upload", "", "space-y-6") as HTMLFormElement;
		Form.enctype = "multipart/form-data";

		const Input: HTMLInputElement = createInput(["file", "", "", true], "avatar", "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600");
		Input.accept = "image/*";
		append(Form, [Input]);
		
		return Form;
	}

	async editEvents() {
		const EditBtn = document.getElementById("edit-profile-btn") as HTMLButtonElement;
		if (!EditBtn)
			return ;
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
			})
		}
	}

	private EditiongProfile(TabContent:  HTMLButtonElement[]) {
		TabContent.forEach(btn => {
			btn.addEventListener('click', () => {
				this.EditingState = TabContent.indexOf(btn);
				switch(this.EditingState) {
					case EditState.AVATAR:
						this.renderUserPopUp("Edit Profile Pic");
						this.editUserInfoEvent();
						break;
					case EditState.USERNAME:
						this.renderUserPopUp("Edit Username");
						this.editUserInfoEvent();
						break;
					default:break;
				}
			})
		})
	}

		/*************************************Functions utils for Popup Event*************************************/
	private editUserInfoEvent() {
		const SaveBtn = document.getElementById("Save-btn") as HTMLButtonElement;
		const CancelBtn = document.getElementById("Cancel-btn") as HTMLButtonElement;
		
		const TabContent: HTMLButtonElement[] = [CancelBtn, SaveBtn];
		
		TabContent.forEach(btn => {
			btn.addEventListener('click', async() =>{
				switch(TabContent.indexOf(btn)) {
					case 0:
						break;
					case 1:
						this.saveDataUser();
						break;
					default:break;
				}
				this.cleanBody();
				this.removeOverlayToWindow();
			})
		})
	}

	private async saveDataUser() {
		switch(this.EditingState) {
			case EditState.AVATAR:
				await this.openUploadForm();
				break;
			case EditState.USERNAME:
				await this.saveUsername();
				break;
		}
	}

	private async saveUsername() {
		try {
			const Form = document.getElementById('Edit-form');
			if (!Form)
				return ;
			const username: string = (Form?.querySelector('input[name="username"]') as HTMLInputElement).value;
			if (!username)
				throw new Error("Please, enter new username");
			if (username == this.UserData.username)
				return ;
			if (username.length > 15)
				throw new Error("username must have maximum 15 characters");
			const req = await updateUsername(username);
			if (req.ok) {
				this.cleanBody();
				await this.updateUserData();
				await navigate(`/user/${this.UserData.slug}`);
			}
			else
				throw new Error(req.error);
		}
		catch (error){
			await ErrorPopup(error as string);
		}
	}

	async openUploadForm() {
		try {
			const form = document.getElementById('avatar-upload-form') as HTMLFormElement;
			if (!form)
				return;
			const input = form.querySelector('input[type="file"]') as HTMLInputElement;
			if (!input.files || input.files.length === 0)
				throw new Error("Please, select a file");
			const file = input.files[0];
  			const headerBuffer = await file.slice(0, 8).arrayBuffer();
			const bytes = new Uint8Array(headerBuffer);
			let verif = 0;
  			if (bytes[0] === 0xFF
				&& bytes[1] === 0xD8
				&& bytes[2] === 0xFF)
			{verif = 1;}
			if (bytes[0] === 0x89 &&
				bytes[1] === 0x50 &&
				bytes[2] === 0x4E &&
				bytes[3] === 0x47 &&
				bytes[4] === 0x0D &&
				bytes[5] === 0x0A &&
				bytes[6] === 0x1A &&
				bytes[7] === 0x0A)
			{verif = 1;}
			if (verif === 0)
				throw new Error("File is not jpg or png");
			const maxSizeBytes = 5 * 1024 * 1024;
			if (file.size > maxSizeBytes)
				throw new Error("File is more than 5GB");
			const formData = new FormData();
			formData.append('avatar-input', file);
			const req = await uploadAvatar(formData);
			if (req.ok) {
				console.log('STRING AVATAR : ', req.avatar);
				const pathReq = await updateAvatar(req.avatar);
				if (pathReq.ok) {
					await this.updateUserData();
					await navigate(`/user/${this.UserData.slug}`);
					return ;
				}
				else
					throw new Error("Error while uploading avatar path in db" + (pathReq.error || "Unknown error"));
			}
			else
				throw new Error("Upload failed: " + (req.error || "Unknown error"));

		} catch(error) {
			await ErrorPopup(error as string);
		}
	}

	private async updateUserData(){
		try {
			const req = await getUserInfo();
			if (req.ok) {
				console.log('new usernme = ', req.userInfo.username)
				this.UserData = req.userInfo;
			}
			else
				throw new Error(req.error);
		} catch (error) {
			await ErrorPopup(error as string);
		}
	}
}