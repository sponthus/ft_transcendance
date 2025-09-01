import { navigate } from '../core/router.js';
import { checkLog } from "../api/check-log.js";
import { loginUser } from "../api/user.js";
import { BasePage } from "./BasePage.js";
import { createLogo } from './RegisterPage.js';
import { createDiv, createElement, append, createFormDiv, createButton, createAnchorElement } from '../Utils/elementMaker.js';

export class LoginPage extends BasePage {

	private Background!: HTMLElement;
	private Front!: HTMLElement;
	private TopTextDiv!: HTMLElement;
	private Form!: HTMLFormElement;
	private BotTextDiv!: HTMLElement;

    constructor() {
        super();
    }

    async render(): Promise<void> {
		this.app.innerHTML = "";
		this.renderBanner();

		await this.initDivs();
		await this.createTopText();
		await this.createGlobalForm();
		await this.createBotText();
		await this.addInApp();
		await this.watchForm();
    }

	private async initDivs(): Promise<void> {
		this.Background = this.initBackground();
		this.Background.className = "flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 p-8";
		this.Front = createDiv('front', 'rounded-xl shadow-2xl p-12 max-w-md text-center w-full space-y-4');
		this.TopTextDiv = createDiv("top-text", "text-center mb-8");
		this.BotTextDiv = createDiv("bot-text", "mt-6 text-center");
		this.Form = createElement('form', "register-form", "", "space-y-6") as HTMLFormElement;
	}

	private async createTopText(): Promise<void>  {
		append(this.TopTextDiv, [(createLogo("M15 12H3m0 0l4-4m-4 4l4 4m13-9v10a2 2 0 01-2 2h-6") as HTMLElement)
						, (createElement('h1', "create-account", "Login", "text-3xl font-bold text-emerald-600 mb-2") as HTMLElement)
						, (createElement('p', "", "Sign in to your account", "text-emerald-600") as HTMLElement)]);
	}

	private async createGlobalForm(): Promise<void>  {
		const ClassNames: [DivClass:string, LabelClass: string, InputClass: string, TextClass: string] = [""
										, "block text-sm font-medium text-emerald-600 mb-2"
										, "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600"
										, "block text-sm  text-center font-medium text-emerald-500 mb-2"];
		
		append (this.Form, [(createFormDiv(["text", 'username', "username", true], "username",   "Enter your username",  ClassNames) as HTMLElement)
							, (createFormDiv(["password", 'password', "password", true], "password", "Enter your password", ClassNames) as HTMLElement)
							,(createButton("submit", "w-full bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300", "Sign In") as HTMLButtonElement)])
	}
	
	private async createBotText() {
		append(this.BotTextDiv, [(createElement('p', 'bot-text', "Don't have an account?", "text-sm text-emerald-600") as HTMLElement)
								, (createAnchorElement('bot-ling',  "Sign up", "/register", "text-emerald-800 hover:text-emerald-900 font-medium hover:underline") as HTMLAnchorElement)]);
	}

	
	private async addInApp() {
		append(this.Front, [this.TopTextDiv, this.Form, this.BotTextDiv]);
		append(this.Background, [this.Front]);
		append(this.app, [this.Background]);
	}

	private async watchForm() {
				
		if (!this.Form) 
			this.ErrorForm();
		else {
			this.Form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			const formData = new FormData(form);

			const username = formData.get('username') as string;
			const password = formData.get('password') as string;

			const req = await loginUser(username, password);
			if (req.ok) {
			    await navigate('/');
				location.reload();
			    return ;
			}
			else {
			    if (req.error)
			        alert("Connexion failure : " + req.error);
			    else
			        alert("Connexion failure");
			}
			});
		}
	}

	private async ErrorForm() {
		this.app.innerHTML = `
			<div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-8">
				<div class="bg-white rounded-xl shadow-2xl p-12 max-w-md w-full text-center">
					<svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<h1 class="text-3xl font-bold text-red-600 mb-4">Error</h1>
					<p class="text-gray-600 mb-6">Unable to load the Login form</p>
					<a href="/" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
						Go to Home
					</a>
				</div>
			</div>
		`;
	}
}

