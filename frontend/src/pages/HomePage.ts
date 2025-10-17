import { BasePage } from "./BasePage.js";
import { append, createAnchorElement, createDiv, createImage } from "../Utils/elementMaker.js";
import { checkLog } from "../api/user-service/connection/check-log.js";
import { ErrorPopup } from "./ErrorPage.js";
import { navigate } from "../core/router.js";
import { getAllFriendsBySlug } from "../api/user-service/menu/friendsList/friendRequest.js";

export class HomePage extends BasePage {

	private Background!: HTMLElement;
	private Front!: HTMLElement;
	private ButtonDiv!: HTMLElement;
	private LogoDiv!: HTMLElement;

	constructor() {
		super();
	}

	async render(): Promise<void> {


		await this.renderBanner();
		await this.InitDivs();
		await this.createLogo();

		const res = await checkLog();
		if (res.ok) {
			await this.renderLogInHome();
		}
		else {
			await this.rengerLogoutHome();
		}

	await this.addInApp();
	}

	private async InitDivs() {
		this.Background = this.initBackground();
		this.Background.className = "flex flex-col items-center justify-center min-h-screen min-w-screen p-8";
		this.Front = createDiv("front", "flex items-center justify-center rounded-xl p-12 max-w-md  w-full h-[30%] text-center");
		this.ButtonDiv = createDiv("Button", "flex flex-col items-center justify-center space-y-6 w-full");
	}

	private async createLogo() {
	this.LogoDiv = createDiv("logo", "relative grid place-items-center min-h-[70%] h-[70%] min-w-full w-full animate-wiggle -my-[30px]");
	append(this.LogoDiv, [
	    (createImage("logo", "col-start-1 row-start-1 object-contain h-[100%] w-[70%]", "/logo/logo_final.png") as HTMLImageElement)]);
		append(this.Background, [this.LogoDiv]);
	}

	private async renderLogInHome() {
		append(this.ButtonDiv, [(createAnchorElement("play", "click to play", '/game', "w-full mt-8 bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-4 px-8 rounded-lg text-xl transition-colorsduration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300") as HTMLAnchorElement)])
	}

	private async rengerLogoutHome() {
		append(this.ButtonDiv, [(createAnchorElement("login", "Login", '/login', "w-full mt-8 bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-4 px-8 rounded-lg text-xl transition-colorsduration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300") as HTMLAnchorElement)
								, (createAnchorElement("register", "Register", '/register', "w-full mt-8 bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-4 px-8 rounded-lg text-xl transition-colorsduration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300") as HTMLAnchorElement) ]);
	}

	/*************************************Function utils*************************************/
	private async addInApp() {
		append(this.Front, [this.ButtonDiv]);
		append(this.Background, [this.Front]);
		append(this.app, [this.Background]);
	}
}
