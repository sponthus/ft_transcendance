import { checkLog } from "../api/user-service/connection/check-log.js";
import { loginUser } from "../api/user-service/connection/loginUser.js";
import { navigate } from '../core/router.js';
import { BasePage } from "./BasePage.js";

export class LoginPage extends BasePage {

	private _Background?: HTMLElement;
	private _front?: HTMLElement;
	private _TopTextDiv?: HTMLElement;
	private _form?: HTMLFormElement;
	private _BotTextDiv?: HTMLElement;

    constructor() {
        super();
    }

    async render(): Promise<void> {
		const res = await checkLog();
	
		// if (res.ok) {
		// 	this.app.innerHTML = `
		// 	<h1></h1>
		// 	<h1>Already logged in as ${res.user.username}.</h1>
        //     `;
		// 	return ;
        // }
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
		this._Background = this.initBackground();
		this._Background.className = "flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-orange-300 p-8";

		this._front = document.createElement('div');
		this._front.className = "rounded-xl shadow-2xl p-12 max-w-md text-center w-full space-y-4";

		this._TopTextDiv = document.createElement('div');
		this._TopTextDiv.className = "text-center mb-8";

		this._BotTextDiv= document.createElement('div');
		this._BotTextDiv.className = "mt-6 text-center";

		this._form = document.createElement('form');
		this._form.id = "login-form";
		this._form.className = "space-y-6";
	}

	private async createTopText(): Promise<void>  {
		await this.createLogo();
		if (this._TopTextDiv) {
			await this.addText('h1', "text-3xl font-bold text-emerald-600 mb-2", "Login", this._TopTextDiv);
			await this.addText('p', "text-emerald-600", "Sign in to your account", this._TopTextDiv)
		}
	}

	private async createGlobalForm(): Promise<void>  {
		await this.createForm("text", "username", "username", "Enter your username");
		await this.createForm("password", "password", "password", "Enter your password");
		
		await this.createSubmitButton();
	}
	
	private async createBotText() {
		if (this._BotTextDiv)
			await this.addText('p', "text-sm text-emerald-600", "Don't have an account?", this._BotTextDiv);
		await this.createBotLink();
	}

	/*************************************Function for creating Top Text*************************************/
	private async createLogo(): Promise<void> {
		const logoDiv: HTMLElement = document.createElement('div');
		logoDiv.className = "mb-4";

		const logoSvg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		logoSvg.setAttribute("class", "w-12 h-12 mx-auto text-emerald-600");
		logoSvg.setAttribute("fill", "none");
		logoSvg.setAttribute("stroke", "currentColor");
		logoSvg.setAttribute("viewBox", "0 0 24 24");

		const logoPath: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg" ,'path');
		logoPath.setAttribute("stroke-linecap", "round");
		logoPath.setAttribute("stroke-linejoin", "round");
		logoPath.setAttribute("stroke-width", "2");
		logoPath.setAttribute("d", "M15 12H3m0 0l4-4m-4 4l4 4m13-9v10a2 2 0 01-2 2h-6");

		logoSvg.appendChild(logoPath);
		logoDiv.appendChild(logoSvg);

		if (this._TopTextDiv)
			this._TopTextDiv.appendChild(logoDiv);
	}
	
	/*************************************Function for creating Form*************************************/
	private async createForm(type: string, name: string, placeHolder: string, texteContent:string): Promise<void>  {
		const Div: HTMLElement = document.createElement('div');
		
		const Label: HTMLLabelElement = document.createElement('label');
		Label.htmlFor = name;
		Label.className = "block text-sm font-medium text-emerald-600 mb-2";
		
		const Input: HTMLInputElement = document.createElement('input');
		Input.className = "w-full px-4 py-3 border bg-orange-200 border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-emerald-8 	00 transition-colors duration-200 placeholder-emerald-600";
		Input.type = type;
		Input.name = name;
		Input.id = name;
		Input.placeholder = placeHolder;
		Input.required = true;
		
		const Text: HTMLElement = document.createElement('p');
		Text.textContent = texteContent;
		Text.className = "block text-sm text-left font-medium text-emerald-500 mb-2";
		
		
		Div.appendChild(Text);
		Div.appendChild(Label);
		Div.appendChild(Input);
		
		if (this._form)
			this._form.appendChild(Div);
	}
	
	private async createSubmitButton(): Promise<void>  {
		const ButtonForm: HTMLButtonElement = document.createElement('button');
		ButtonForm.type = "submit";
		ButtonForm.className = "w-full bg-orange-300 hover:bg-orange-400 text-emerald-600 font-bold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
		ButtonForm.textContent = "Sign In";
		
		if (this._form)
			this._form.appendChild(ButtonForm);
	}

	/*************************************Function for creating Bot Text*************************************/
	private async createBotLink() {
		const TextBotlink: HTMLAnchorElement = document.createElement('a');
		TextBotlink.href = "/register";
		TextBotlink.className = "text-emerald-800 hover:text-emerald-900 font-medium hover:underline"
		TextBotlink.textContent = "Sign up";
		
		if (this._BotTextDiv)
			this._BotTextDiv.appendChild(TextBotlink);
	}
	
	/*************************************Function Utils*************************************/
	private async addText(Element: string, ClassName: string, TextContent: string, Div: HTMLElement) {
			const Text: HTMLElement = document.createElement(Element);
			Text.className = ClassName;
			Text.textContent = TextContent;
	
			if (Div)
				Div.appendChild(Text);
		}
	
	private async addInApp() {
		if (this._Background && this._front && this._TopTextDiv && this._form && this._BotTextDiv) {
			this._front.appendChild(this._TopTextDiv);
			this._front.appendChild(this._form);
			this._front.appendChild(this._BotTextDiv);
			this._Background.appendChild(this._front);
			this.app.appendChild(this._Background);
		}
	}

	private async watchForm() {
				
		if (!this._form) 
			this.ErrorForm();
		else {
			this._form.addEventListener('submit', async (e) => {
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

