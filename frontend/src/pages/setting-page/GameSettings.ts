
import { getCharacterAsset } from '../../api/user-service/menu/characterAsset.js';
import { getNpcAsset } from '../../api/user-service/menu/npcAsset.js';
import {createDiv, createButton, append, createImage} from '../../Utils/elementMaker.js';
import { ErrorPopup } from '../ErrorPage.js';

let CurrentAvatarAsset: number = 0;
let CurrentNpcAsset: number = 0;

const AvatarMap: Map<number, HTMLButtonElement> = new Map< number, HTMLButtonElement>();
const NPCMap: Map<number, HTMLButtonElement> = new Map< number, HTMLButtonElement>();

export async function  renderGameSetting(ButtonDiv: HTMLElement, SettingDiv: HTMLElement, ReturnDiv: HTMLElement){
	await setCurrentAvatar();
	await setCurrentNpc();
	ButtonDiv.classList.add('opacity-0');
	append(SettingDiv, [createAvatarBtn("Lobby-user-avatar", 18, "/asset/Characters/Previews/Previews/", "change Lobby user Avatar :", true)
							,createAvatarBtn("Lobby-npc-avatar", 11, "/asset/Characters/Previews/Previews1/", "change Lobby npc Avatar :", false)]);
	
	manageEventAvatar("Lobby-user-avatar-btn", "Lobby-user-avatar-btn-div");
	manageClicAvatarkEvent(AvatarMap, true);
	manageEventAvatar("Lobby-npc-avatar-btn", "Lobby-npc-avatar-btn-div");
	manageClicAvatarkEvent(NPCMap, false);

	SettingDiv.classList.remove('opacity-0')
	setTimeout(async() => {
		ReturnDiv.classList.remove('hidden');
		ButtonDiv.classList.add('hidden');
		SettingDiv.classList.remove('hidden');
	}, 300);
}


function createAvatarBtn(Id: string, MaxI: number, Folder: string, TextContent: string, Avatar: boolean) : HTMLElement {
	const Div: HTMLElement = createDiv(Id, "flex flex-col items-center justify-center space-y-8");
	append(Div, [createButton(Id, "text-emerald-600 text-center bg-orange-300 hover:bg-orange-400 hover:font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full", TextContent)
							, createDropdownAvatar(Id, MaxI, Folder, Avatar)]);
	return Div;
}

async function setCurrentAvatar() {
	try {
		const req = await  getCharacterAsset();
		if (req.ok && req.asset)
			CurrentAvatarAsset = req.asset;
	} catch(error) {
		ErrorPopup(error as string);
	}
}

async function setCurrentNpc() {
	try {
		const req = await getNpcAsset();
		if (req.ok && req.asset)
			CurrentNpcAsset = req.asset;
	} catch (error) {
		ErrorPopup(error as string);
	}
}

function createDropdownAvatar(Id: string, MaxI: number, Folder: string, Avatar: boolean): HTMLElement {
	const BtnDiv = createDiv(Id + "-btn", "flex flex-wrap items-center justify-center gap-4 h-0 opacity-0 ease-in-out transition-all duration-200");
	AddAvatarBtns(BtnDiv, Id, MaxI, Folder, Avatar);
	return BtnDiv;
}

function AddAvatarBtns(parent: HTMLElement ,Id: string, MaxI: number, Folder: string, Avatar: boolean) {
		for (let i = 0; i < MaxI; i++) {
			const btn: HTMLButtonElement = createButton(`${Id}${i.toString()}`, "h-26 aspect-square border-2 border-orange-300 hover:bg-orange-400 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105", "")

			const src = `${Folder}character-${i.toString()}.png`;
			// console.log('src = ', src);
			const img: HTMLImageElement = createImage(`${Id}${i.toString()}`, "h-24 aspect-square", src);
			btn.appendChild(img);
			if (Avatar) {
				AvatarMap.set(i, btn);
				if (i == CurrentAvatarAsset)
					addHoverBtn(btn);
			}
			else {
				NPCMap.set(i, btn);
				if (i == CurrentNpcAsset)
					addHoverBtn(btn);
			}
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

function manageClicAvatarkEvent(Map: Map<number, HTMLButtonElement>, Avatar: boolean) {
	Map.forEach((value: HTMLButtonElement, key: number) => {
		value.addEventListener('click', () => {
			Map.forEach((value: HTMLButtonElement, key: number) => {
				removeHoverbtn(value);
			})
			addHoverBtn(value);
			if (Avatar)
				CurrentAvatarAsset = key;
			else
				CurrentNpcAsset = key;
			console.log("Avatar ", CurrentAvatarAsset, "NPC ", CurrentNpcAsset);
		})
	})

}

function addHoverBtn(Btn :HTMLButtonElement) {
	Btn.classList.add("bg-orange-400");
	Btn.classList.add("scale-105");
}

function removeHoverbtn(Btn :HTMLButtonElement) {
	Btn.classList.remove("bg-orange-400");
	Btn.classList.remove("scale-105");
}

export function getAvatarAsset() : number {
	console.log("avatar asset ",CurrentAvatarAsset);
	return CurrentAvatarAsset;
}

export function getCurrentNpcAsset(): number {
	console.log("NPC asset", CurrentNpcAsset);
	return CurrentNpcAsset;
}