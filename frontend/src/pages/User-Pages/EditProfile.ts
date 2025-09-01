import { popUp } from "../../Utils/popUp";
import { State } from '../../core/state.js';
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage, createInput} from '../../Utils/elementMaker.js';
import { getUserInfo, modifyUserAvatar , modifyUserInfo } from "../../api/user.js";
import { uploadAvatar } from "../../api/avatar.js";
import { navigate } from '../../core/router.js';

enum EditState {AVATAR = 0, USERNAME = 1};
const state = State.getInstance();

export class EditProfile extends popUp {

	protected slug?: string;

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
		this.slug = state.user?.slug;
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
						this.renderUserPopUp("Edit Profile Pic");
						console.log("Editing Avatar");
						this.editUserInfoEvent();
						break;
					case EditState.USERNAME:
						console.log("editing username");
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
				this.cleanBody();
				this.removeOverlayToWindow();
			})
		})
	}

	private async saveDataUser() {
		await this.saveUsername();
		this.openUploadForm();
	}

	private async saveUsername() {
		const Form = document.getElementById('Edit-form');
		
		const username: string = (Form?.querySelector('input[name="username"]') as HTMLInputElement).value;

		if (username == this.UserData.username) {
			return ;
		}

		const req = await modifyUserInfo(this.UserData.slug, username);
		if (req.ok) {
			console.log("Username edited successfully");
			this.cleanBody();
			this.updateUserData();
			navigate(`/user/${this.UserData.slug}`);
			location.reload();
		}
		else
			alert(req.error);
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
		formData.append('avatar-input', file);
		console.log(`sending file: ${file}`);
		
		// Makes 2 requests : upload to upload service + change avatar in user db
		const req = await uploadAvatar(this.UserData.slug, formData);
		if (req.ok) {
			alert("Avatar updated successfully!");
			const pathReq = await modifyUserAvatar(this.UserData.slug, req.avatar);
			if (pathReq.ok) {
				await navigate(`/user/${this.UserData.slug}`);
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

	private async updateUserData(){
		const req = await getUserInfo(state.user?.slug!);
		if (req.ok) {
			this.UserData = req.user;
			console.log(`user data = ` + JSON.stringify(this.UserData));
		}
	}
}