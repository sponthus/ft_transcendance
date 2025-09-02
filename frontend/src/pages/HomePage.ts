import { checkLog } from "../api/user-service/connection/check-log.js";
import { navigate } from "../core/router.js";
import { BasePage } from "./BasePage.js";
import { getUserInfo } from "../api/user-service/user-info/getUserInfo.js";
import { updateUsername } from "../api/user-service/user-info/updateUsername.js";
import { addFriend } from "../api/user-service/menu/friendsList.js";

export class HomePage extends BasePage {

	private _Background?: HTMLElement;
	private _front?: HTMLElement;
	private _ButtonDiv?: HTMLElement;
	private _LogoDiv?: HTMLElement;

    constructor() {
        super();
    }

	//ou mettre le check log ? 
    async render(): Promise<void> {

		
		await this.renderBanner();
		
		await this.InitDivs();
		await this.createLogo();
		
		/*if (state.isLoggedIn()) 
			await this.renderLogInHome();*/
		//verifier que ca marche 
		console.log("Check si token existe dans home page");
		const res = await checkLog();
		if (res.ok)
		{
			await this.renderLogInHome();
		}
		else 
		{
			await this.rengerLogoutHome();
			if (res.error)
				alert(res.error); //Met une alerte sur l'absence ou l'expiration du token
		}
		await this.addInApp();
    }
	
	private async InitDivs() {
		this._Background = this.initBackground();
		
		this._front = document.createElement('div');
		this._front.className = "rounded-xl shadow-2xl p-12 max-w-md w-full text-center";
		
		this._ButtonDiv = document.createElement('div');
		this._ButtonDiv.className = "flex flex-col ispace-y-4";
	}
	
	private async createLogo() {
		const LogoDiv = this.initLogo();
	
		if (this._Background)
			this._Background.appendChild(LogoDiv);
	}

	private async renderLogInHome() {
		await this.createButton('play-btn', "click to play", '/game');
	}

	private async rengerLogoutHome() {

		await this.createButton('login-btn', "Login", '/login');
		await this.createButton('register-btn', "Register", '/register');
	}

	/*************************************Function for creating Button*************************************/
	private async createButton(Id: string, TextContent: string, link: string) {
		const Button = document.createElement('a');
		Button.id = Id;
		Button.href = link;
		Button.textContent = TextContent;
		Button.className = "w-full mt-8 bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-4 px-8 rounded-lg text-xl transition-colorsduration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300";

		if (this._ButtonDiv)
			this._ButtonDiv.appendChild(Button);
	}

	/*************************************Function for creating logo*************************************/
	private initLogo(): HTMLElement {
		const logoDiv = document.createElement('div');
		logoDiv.className = "flex items-center justify-center relative h-full w-full ";
		
		const logo = document.createElement('img');
		logo.id = "logo-img";
		logo.className = "mx-auto object-cover object-center h-1/2 w-1/2";
		logo.src = "/logo/logoIlsandWorld.png";
		
		const logoTitleText = document.createElement('img');
		logoTitleText.id = "logo-title-Text";
		logoTitleText.className = "absolute h-1/2 w-1/2 bottom-4";
		logoTitleText.src = "/logo/IslandWorldText.png";
		
		const loglWelcomeText = document.createElement('img');
		loglWelcomeText.id = "logo-Welcome.text";
		loglWelcomeText.className = "absolute h-1/2 w-1/2 translate-x-14";
		loglWelcomeText.src = "/logo/welcomeText.png";
		
		logoDiv.appendChild(logo);
		logoDiv.appendChild(loglWelcomeText);
		logoDiv.appendChild(logoTitleText);
		
		return logoDiv;
	}

	/*************************************Function utils*************************************/
	private async addInApp() {
		if (this._Background && this._front && this._ButtonDiv) {
			this._front.appendChild(this._ButtonDiv);
			this._Background.appendChild(this._front);
			this.app.appendChild(this._Background);
		}
	}
}
