import { checkLog } from "../api/user-service/connection/check-log.js";
import { navigate } from "../core/router.js";
import { BasePage } from "./BasePage.js";
import { getUserInfo } from "../api/user-service/user-info/getUserInfo.js";
import { updateUsername } from "../api/user-service/user-info/updateUsername.js";
import { acceptRequest, addFriend, getAllFriends, refuseRequest, removeFriend} from "../api/user-service/menu/friendsList/friendsList.js";

import { getAllUsers } from "../api/user-service/menu/getAllUsers.js";
import { append, createAnchorElement, createDiv, createImage } from "../Utils/elementMaker.js";

export class HomePage extends BasePage {

	private Background!: HTMLElement;
	private Front!: HTMLElement;
	private ButtonDiv!: HTMLElement;
	private LogoDiv!: HTMLElement;

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
		if (res.ok) {
			await this.renderLogInHome();
		}
		else {
			await this.rengerLogoutHome();
		}
	
		let req = await getAllFriends();
		if (req.ok) {
			console.log('Friends : ', req.friends);
		}
		else
			alert(req.error);


/*		let req = await refuseRequest("Pedro");
		if (req.ok) {
			console.log("accept request sucessfully");
		}
		else
			alert(req.error);
*/
		await this.addInApp();
	}

	private async InitDivs() {
		this.Background = this.initBackground();
		this.Front = createDiv("front", "flex items-center justify-center rounded-xl shadow-2xl p-12 max-w-md w-full h-[30%] text-center");
		this.ButtonDiv = createDiv("Button", "flex flex-col items-center justify-center space-y-6 w-full");
	}

	private async createLogo() {
		this.LogoDiv = createDiv("logo", "flex items-center justify-center h-[70%] w-full");
		append(this.LogoDiv, [(createImage("logo", "mx-auto object-contain object-center absolute h-[70%] w-[70%]", "/logo/logoIlsandWorld.png") as HTMLImageElement)
						, (createImage("logo-title-Text", "absolute h-1/2 w-1/2 translate-y-32", "/logo/IslandWorldText.png") as HTMLImageElement)
						, (createImage("logo-Welcome.text", "absolute h-1/2 w-1/2 translate-x-14",  "/logo/welcomeText.png") as HTMLImageElement)]);
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
