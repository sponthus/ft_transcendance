
import {createDiv, createButton, append, createImage} from '../../Utils/elementMaker.js';

UserCharactere: Map<number, HTMLElement>;

export async function  renderGameSetting(SettingText: HTMLElement, ButtonDiv: HTMLElement, SettingDiv: HTMLElement, ReturnDiv: HTMLElement){
	SettingText.textContent = "Game Settings";
	ButtonDiv.classList.add('hidden');
	append(SettingDiv, [createAvatarBtn("Lobby-user-avatar", 18, "/asset/Characters/Previews/Previews/", "change Lobby user Avatar :")
							,createAvatarBtn("Lobby-png-avatar", 11, "/asset/Characters/Previews/Previews1/", "change Lobby png Avatar :")]);
	
	manageEventAvatar("Lobby-user-avatar-btn", "Lobby-user-avatar-btn-div");
	manageEventAvatar("Lobby-png-avatar-btn", "Lobby-png-avatar-btn-div");
	ReturnDiv.classList.remove('hidden');
}

function createAvatarBtn(Id: string, MaxI: number, Folder: string, TextContent: string) : HTMLElement {
	const Div = createDiv(Id, "flex flex-col items-center justify-center space-y-8");
	append(Div, [createButton(Id, "text-emerald-600 text-center bg-orange-300 hover:bg-orange-400 hover:font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105", TextContent)
							, createDropdownAvatar(Id, MaxI, Folder)]);
	return Div;
}

function createDropdownAvatar(Id: string, MaxI: number, Folder: string): HTMLElement {
	const BtnDiv = createDiv(Id + "-btn", "flex flex-wrap items-center justify-center gap-4 h-0 opacity-0 ease-in-out transition-all duration-200");
	AddAvatarBtns(BtnDiv, Id, MaxI, Folder);
	return BtnDiv;
}

function AddAvatarBtns(parent: HTMLElement ,Id: string, MaxI: number, Folder: string) {
		for (let i = 0; i < MaxI; i++) {
			const btn: HTMLButtonElement = createButton(`${Id}${i.toString()}`, "h-16 aspect-square border-2 border-orange-300 hover:bg-orange-400 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105", "")

			const src = `${Folder}character-${i.toString()}.png`;
			console.log('src = ', src);
			const img: HTMLImageElement = createImage(`${Id}${i.toString()}`, "h-14 aspect-square", src);
			btn.appendChild(img);
			parent.appendChild(btn);
		}
}

function manageEventAvatar(IdBtn: string, IdDiv: string) {
	const btn = document.getElementById(IdBtn) as HTMLButtonElement;
	const Div = document.getElementById(IdDiv) as HTMLElement;
	btn.addEventListener('click', () =>{
		if (Div.classList.contains("opacity-0")) {
			Div.classList.remove('h-0');
			setTimeout(() => {
				Div.classList.remove('opacity-0');
				Div.classList.add('opacity-100');
			}, 150);
		}
		else {
			Div.classList.add('opacity-0');
			Div.classList.remove('opacity-100');			
			setTimeout(() => {
				Div.classList.add('h-0');
			}, 150);

		}
	})
}