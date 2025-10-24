
import { updatePassword } from '../../api/user-service/user-info/updatePassword.js';
import { activateTwoFaBtn } from '../../Utils/2FAPopUp.js';
import {createFormDiv, append, createElement, setbackgroundImages, createButton} from '../../Utils/elementMaker.js';
import { ErrorPopup } from '../ErrorPage.js';

let form: HTMLFormElement;
let twofabtn: HTMLButtonElement;


export async function renderProfileSetting(ButtonDiv: HTMLElement, SettingDiv: HTMLElement, ReturnDiv: HTMLElement) {
	form = createElement('form', "register-form", "", "space-y-6") as HTMLFormElement;
	twofabtn = createButton('twofa', 'w-full active:scale-95 hover:scale-105 text-orange-200', '2FA authentification');
	ButtonDiv.classList.add('opacity-0');
	ButtonDiv.classList.add('-translate-x-96');
	SettingDiv.classList.add('translate-x-96');

	setbackgroundImages(twofabtn, "url('game_ui/setting/emptyPan.png')");

	append(form, [(createFormDiv(["password", "new-password", "choose a new password", true]
						, "new-pass"
						, "pleasez choose new password"
						, [""
							, "block text-sm font-medium text-emerald-500 mb-2"
							, "w-full px-4 py-3 border bg-orange-200 border-green-800 rounded-lg"
							, "block text-sm  text-center font-medium text-orange-200 mb-2 font-bold"]) as HTMLElement )
						, (createFormDiv(["password", "confirm-password", "confirm a new password", true]
						, "confirm-pass"
						, "please confirm new password"
						, [""
							, "block text-sm font-medium text-emerald-500 mb-2"
							, "w-full px-4 py-3 border bg-orange-200 border-green-800 rounded-lg"
							, "block text-sm  text-center font-medium text-orange-200 mb-2 font-bold"]) as HTMLElement )]);

	append(SettingDiv, [form, twofabtn]);
	twofabtn.addEventListener('click', async() => {await activateTwoFaBtn();});

	SettingDiv.classList.remove('opacity-0')
	SettingDiv.classList.remove('hidden');
	setTimeout(async() => {
		ReturnDiv.classList.remove('hidden');
		ButtonDiv.classList.add('hidden');
		SettingDiv.classList.remove('translate-x-96');
		setbackgroundImages(SettingDiv, "url('game_ui/setting/SettingPan.png')");
	}, 300);
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
			if ((!ConfirmPassword && password) || (ConfirmPassword && !password))
				throw new Error("Please complete password form");
			else if (password && ConfirmPassword && password != ConfirmPassword)
				throw new Error("Missmatch passwords");
			if (password && ConfirmPassword) {
				const req = await updatePassword(password);
				if (!req.ok)
					throw new Error(req.error);
			}

		} catch(error) {
			await ErrorPopup(error as string);
		}
	}
}