import {Game} from "../babylon/main.js"
import { BasePage } from '../pages/BasePage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { SettingPage } from "../pages/setting-page/SettingPage.js";
import { UserPage } from "../pages/User-Pages/UserPage.js";
import { State } from "./state.js";
import { GamePage } from "../pages/Game-Pages/GamePage.js";
import { LocalGamePage } from "../pages/Game-Pages/LocalGamePage.js";

const state = State.getInstance();

let currentPage: BasePage | null = null;

export async function renderRoute(path: string) {
    currentPage?.destroy();

    // Dynamic routes
    if (path.startsWith('/user/')) {
        console.log("before navigation" + state.user?.username);
        const username = path.slice('/user/'.length);
        // const { UserPage } = await import('./pages/UserPage.js');
        currentPage = new UserPage(username);
    }
    else {
        console.log("before navigation" + state.user?.username);
        // Static routes
	switch (path) {
	    	case '/':
				currentPage = new HomePage();
				break;
            case '/login':
                currentPage = new LoginPage();
                break;
            case '/register':
                currentPage = new RegisterPage();
                break;
            case '/game':
				console.log("state user :", state.user)
				console.log("user slug :", state.user?.slug);
				currentPage = new Game(state.user!.slug);
				// currentPage = new LocalGamePage();
                break;
            case '/setting':
                currentPage = new SettingPage();
                break;
            default:
                currentPage = null;
                break;
			case '/setting':
				currentPage = new SettingPage();
        }
    }

    if (currentPage) {
        await currentPage.render();
    }
    else {
        document.getElementById('app')!.innerHTML = `<h1>404 - Page not found</h1>`;
    }
}

export async function navigate(path: string) {
    history.pushState(null, '', path);
    await renderRoute(path);
}

export async function setupRouter() {
    // Handles clicks on intern <a>
    document.body.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.matches('[data-link]')) {
            event.preventDefault();
            const href = target.getAttribute('href');
            if (href) {
                navigate(href);
			}
        }
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
        renderRoute(location.pathname);
    });

    await renderRoute(location.pathname); // Shows good screen when loading
}