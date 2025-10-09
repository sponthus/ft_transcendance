
import { updatePassword } from '../../api/user-service/user-info/updatePassword.js';
import { activateTwoFaBtn } from '../../Utils/2FAPopUp.js';
import {createFormDiv, append, createElement, setbackgroundImages, createImage, createButton, createDiv, createInput} from '../../Utils/elementMaker.js';
import { ErrorPopup } from '../ErrorPage.js';

let form: HTMLFormElement = createElement('form', "register-form", "", "space-y-6") as HTMLFormElement;
let twofabtn: HTMLButtonElement = createButton('twofa', 'w-full active:scale-95 hover:scale-105 bg-orange-200 text-emerald-500', '2FA authentification');


export async function renderProfileSetting(ButtonDiv: HTMLElement, SettingDiv: HTMLElement, ReturnDiv: HTMLElement) {
	// SettingText.textContent = "Profile Settings";
	ButtonDiv.classList.add('hidden');

	// setbackgroundImages(SettingDiv, "url('game_ui/setting/SettingPan.png')");

	append(form, [(createFormDiv(["password", "new-password", "choose a new password", true]
						, "new-pass"
						, "please choose new password"
						, [""
							, "block text-sm font-medium text-emerald-500 mb-2"
							, "w-full px-4 py-3 border bg-orange-200 border-emerald-500 rounded-lg"
							, "block text-sm  text-center font-medium text-emerald-500 mb-2"]) as HTMLElement )
						, (createFormDiv(["password", "confirm-password", "confirm a new password", true]
						, "confirm-pass"
						, "please confirm new password"
						, [""
							, "block text-sm font-medium text-emerald-500 mb-2"
							, "w-full px-4 py-3 border bg-orange-200 border-emerald-500 rounded-lg"
							, "block text-sm  text-center font-medium text-emerald-500 mb-2"]) as HTMLElement )]);

	append(SettingDiv, [form, twofabtn]);
	twofabtn.addEventListener('click', async() => {await activateTwoFaBtn();});
	ReturnDiv.classList.remove('hidden');
}

export function cleanForm() {
	Array.from(form.children).forEach(child => {child.remove();});
}


export async function saveUserForm() {
	if (!form)
		return;
	else {
		try {
			const formData = new FormData(form);
			const password = formData.get('new-pass') as string;
			const ConfirmPassword = formData.get('confirm-pass') as string;
			console.log('save userform function called ', password, ' ', ConfirmPassword);
			if ((!ConfirmPassword && password) || (ConfirmPassword && !password))
				throw new Error("please complete password form");
			else if (password && ConfirmPassword && password != ConfirmPassword)
				throw new Error("dissmatch passwords");
			if (password && ConfirmPassword) {
				const req = await updatePassword(password);
			}

		} catch(error) {
			ErrorPopup(error as string);
		}
	}
}