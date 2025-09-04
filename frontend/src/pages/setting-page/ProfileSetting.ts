import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage} from '../../Utils/elementMaker.js';

export async function renderProfileSetting(SettingText: HTMLElement, ButtonDiv: HTMLElement, SettingDiv: HTMLElement, ReturnDiv: HTMLElement) {
	SettingText.textContent = "Profile Settings";
	ButtonDiv.classList.add('hidden');

	append(SettingDiv, [(createFormDiv(["password", "new-password", "choose a new password", true]
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

	ReturnDiv.classList.remove('hidden');
}
