import { navigate } from "../core/router";
import { BasePage } from "./BasePage";
import { DropDown } from "../Utils/dropDown";
import { checkLog } from "../api/user-service/connection/check-log";

export class SettingPage extends BasePage {

	constructor () {
		super();
	}

	async render(): Promise<void> {
		const req = await checkLog();
		if (req.ok) {
			// console.log('debug info : user is logged in');

			this.renderBanner();

			await this.createHomeSetting();
			await this.createGameSetting();
			await this.createProfileSetting();

			await this.renderHomeSetting();
		}
		else
			navigate('/');
	}

	private async createHomeSetting() {
	
			const Background: HTMLElement = this.initBackground();
			Background.className = "flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 p-8";

			const front = document.createElement('div');
			front.id = "Setting_front";
			front.className = "rounded-xl shadow-2xl p-12 max-w-md w-full text-center  space-y-4";

			const SettingText: HTMLElement = document.createElement('h1');
			SettingText.id = "setting_text";
			SettingText.className = "text-emerald-600 text-2xl py-3 px-6";
			SettingText.textContent = "Settings";

			const ButtonDiv = document.createElement('div');
			ButtonDiv.id = "Button_setting";
			ButtonDiv.className = "flex flex-col space-y-4";

			front.appendChild(SettingText);
			front.appendChild(ButtonDiv!);

			Background.appendChild(front);

			this.app.appendChild(Background);
	}

	private async renderHomeSetting(): Promise<void> {
		const front = document.getElementById("Setting_front") as HTMLElement;
		const ButtonDiv = document.getElementById("Button_setting") as HTMLElement;
		
		if (!ButtonDiv) {
			console.log("can't find Button Div");
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			return ;
		}

		const gameSettingButton: HTMLElement = document.createElement('a');
		gameSettingButton.textContent = "Game Setting";
		gameSettingButton.className = "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-6 rounded-lg transition-colors duration-200transform 	hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300";
		gameSettingButton.addEventListener('click', async(e) => {
			this.renderGameSetting();
		});

		const ProfileSettingButton: HTMLElement = document.createElement('a');
		ProfileSettingButton.textContent = "Profile Setting";
		ProfileSettingButton.className = "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-6 rounded-lg transition-colors duration-200transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300";
		ProfileSettingButton.addEventListener('click', async(e) => {
			this.renderProfileSetting();
		});

		ButtonDiv.appendChild(gameSettingButton);
		ButtonDiv.appendChild(ProfileSettingButton);
	}

	private async createGameSetting(): Promise<void>  {
		await this.createGameModDiv();
		await this.createPlayerMod();
		await this.createScoreLimit();
		await this.createReturnDiv();
	}

	private async createGameModDiv(): Promise<void> {
		this.createDropdown(["classic", "tournament"], "GameMod", "Pong Game Mod :");

		const DropDownDiv = document.getElementById("GameMod_DropDown_div") as HTMLElement;
		const GameModSelect = DropDownDiv.querySelector('select');
		
		console.log("game mod select value = ", GameModSelect?.value);
		if (GameModSelect) {
			//call api for select value
			GameModSelect.addEventListener('change', () => {
				const mixedModoption = document.getElementById("Mixed local AI_option");
				if (GameModSelect.value == "tournament") {
					if (mixedModoption) {
						mixedModoption.classList.remove('hidden');
					}
				}
				else {
					const DropDownDiv = document.getElementById("PlayerMod_DropDown_div") as HTMLElement;
					const PlayerModSelect = DropDownDiv.querySelector('select');
					if (PlayerModSelect && PlayerModSelect.value == "Mixed local AI") {
						PlayerModSelect.value = "1 player vs AI";
					}
					if (mixedModoption) {
						mixedModoption.classList.add('hidden');
					}
				}
				console.log("game mod selected ", GameModSelect.value);
			})
		}
	}

	private async createPlayerMod(): Promise<void> {
		this.createDropdown(["1 player vs AI", "Local Multiplayer", "Mixed local AI"], "PlayerMod", "Pong player Mod :");

		const DropDownDiv = document.getElementById("PlayerMod_DropDown_div") as HTMLElement;
		const PlayerModSelect = DropDownDiv.querySelector('select');

		const mixedModoption = document.getElementById("Mixed local AI_option");
		if (mixedModoption)
			mixedModoption.classList.add('hidden');

		console.log("select value for player mod = ", PlayerModSelect?.value);
		if (PlayerModSelect) {
			//call api for select value
			PlayerModSelect.addEventListener('change', () => {
				console.log("player mod selected ", PlayerModSelect.value);
			})
		}
	}

	private async createScoreLimit(): Promise<void> {
		this.createDropdown(["5", "10", "15", "20", "No Limit"], "ScoreLimit", "Score Limit");

		const DropDownDiv = document.getElementById("ScoreLimit_DropDown_div") as HTMLElement;
		const ScoreLimitSelect = DropDownDiv.querySelector('select');

		console.log("select value for score limit", ScoreLimitSelect?.value);
		if (ScoreLimitSelect) {
			//call api for select value
			ScoreLimitSelect.addEventListener('change', () =>{
				console.log("score limit selected = ", ScoreLimitSelect.value)
			})
		}
	}

	private async renderGameSetting(): Promise<void> {
		const SettingText = document.getElementById("setting_text") as HTMLElement;
		const ButtonDiv = document.getElementById("Button_setting") as HTMLElement;
		const returnDiv = document.getElementById("return_div") as HTMLElement;
		const GameModDiv = document.getElementById("GameMod_div") as HTMLElement;
		const PlayerModDiv = document.getElementById("PlayerMod_div") as HTMLElement;
		const ScoreLimitMod = document.getElementById("ScoreLimit_div") as HTMLElement;

		if (!SettingText || !ButtonDiv || !returnDiv) {
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			if (!SettingText)
				console.log("can't find SettingText");
			if (!ButtonDiv)
				console.log("can't find ButtonDiv");
			if (!returnDiv)
				console.log("can't find returnDiv");
			return ;
		}
		SettingText.textContent = "Game Settings";
		ButtonDiv.classList.add('hidden');

		returnDiv.classList.remove('hidden');
		GameModDiv.classList.remove('hidden');
		PlayerModDiv.classList.remove('hidden');
		ScoreLimitMod.classList.remove('hidden');
	}
	

	private async createProfileSetting(): Promise<void>  {
		await this.createReturnDiv();
	}

	private async renderProfileSetting(): Promise<void> {
		const SettingText = document.getElementById("setting_text") as HTMLElement;
		const ButtonDiv = document.getElementById("Button_setting") as HTMLElement;
		const returnDiv = document.getElementById("return_div") as HTMLElement;

		if (!SettingText || !ButtonDiv || !returnDiv) {
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			if (!SettingText)
				console.log("can't find SettingText");
			if (!ButtonDiv)
				console.log("can't find ButtonDiv");
			if (!returnDiv)
				console.log("can't find returnDiv");
			return ;
		}

		SettingText.textContent = "Profile Settings";
		ButtonDiv.classList.add('hidden');

		returnDiv.classList.remove('hidden');
	}

	private async createDropdown(Options: string[], Name: string, TextContent: string): Promise<void> {
		const front = document.getElementById("Setting_front") as HTMLElement;
		if (!front) {
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			console.log("can't find front");
			return ;
		}

		const div: HTMLElement = document.createElement('div');
		div.id = Name + "_div";
		div.className = "flex items-center justify-between p-4 bg-orange-300 focus:bg-orange-400  rounded-lg py-3 px-4 space-x-4";

		const Text: HTMLElement = document.createElement('h1');
		Text.className = "w-32 flex-initial text-emerald-600";
		Text.textContent = TextContent;

		const DropDownDiv: DropDown = new DropDown(Options, Name + "_DropDown");
		DropDownDiv.getDropdownDiv.className += "w-64 flex-initial  bg-orange-400 rounded-lg text-emerald-700";

		div.appendChild(Text);
		div.appendChild(DropDownDiv.getDropdownDiv);

		front.appendChild(div);

		div.classList.add('hidden');
	}

	private async createReturnDiv(): Promise<void> {

		const front = document.getElementById("Setting_front") as HTMLElement;
		if (!front) {
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			console.log("can't find front");
			return ;
		}

		const returnDiv: HTMLElement = document.createElement('div');
		returnDiv.id = "return_div"
		returnDiv.className =  "grid grid-cols-2 items-center justify-between p-4 bg-transparent py-3 px-4 space-x-4";

		const ReturnButton: HTMLElement = document.createElement('a');
		ReturnButton.className = "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform";
		ReturnButton.textContent = "return";
		
		const DoneButton: HTMLElement = document.createElement('a');
		DoneButton.className = "bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold rounded-lg transition-colors duration-200transform";
		DoneButton.textContent = "Done";
		
		returnDiv.appendChild(ReturnButton);
		returnDiv.appendChild(DoneButton);

		front.appendChild(returnDiv);
	
		ReturnButton.addEventListener('click', async(e) => {
			await this.Return();
		})
		DoneButton.addEventListener('click', async(e) => {
			// call api for register selection
			await this.Return();
		})

		returnDiv.classList.add('hidden');
	}

	private async Return(): Promise<void> {
		const front = document.getElementById("Setting_front") as HTMLElement;
		const SettingText = document.getElementById("setting_text") as HTMLElement;
		const returnDiv = document.getElementById("return_div") as HTMLElement;
		const ButtonDiv = document.getElementById("Button_setting") as HTMLElement;
		const GameModDiv = document.getElementById("GameMod_div") as HTMLElement;
		const PlayerModDiv = document.getElementById("PlayerMod_div") as HTMLElement;

		if (!SettingText || !front || !returnDiv || !ButtonDiv) {
			this.app.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
			if (!SettingText)
				console.log("can't find SettingText");
			if (!front)
				console.log("can't find front");
			if (!ButtonDiv)
				console.log("can't find ButtonDiv");
			if (!returnDiv)
				console.log("can't find ButtonDiv"); 
			return ;
		}
		SettingText.textContent = "Settings";
		Array.from(front.children).forEach((child, index )=> {
			if (index == 0)
				return ;
			child.classList.add('hidden');
		})
		ButtonDiv.classList.remove('hidden');
	}
}