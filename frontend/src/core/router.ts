import {Game} from "../babylon/main.js"
import { BasePage } from '../pages/BasePage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { SettingPage } from "../pages/SettingPage.js";
import { UserPage } from '../pages/UserPage.js';
import { GamePage } from '../pages/GamePage.js';
import { LocalGamePage } from "../pages/LocalGamePage.js";
import { getUserInfo } from "../api/user-service/user-info/getUserInfo.js";

let currentPage: BasePage | null = null;

export async function renderRoute(path: string) {
    currentPage?.destroy();

    let userData;
    const req = await getUserInfo(); //Est-ce que je peux y mettre en appel en amont pour eviter une surchage de call API ?
    if (req.ok){
        userData = req.userInfo;
    }
    /*else {
        alert("PAS DE USER INFO DANS ROUTER, PAS POSSIBLE NORMALEMENT");//a enlever
    }*/ //router est appeler a chaque fois du coup le message s'affiche a chaque page

    // Dynamic routes
    if (path.startsWith('/user/')) {
        console.log("before navigation" + userData?.username);
        const username = path.slice('/user/'.length);
        // const { UserPage } = await import('./pages/UserPage.js');
        currentPage = new UserPage(username);
    }
    else {
        console.log("before navigation" + userData?.username);
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
				console.log("state user :", userData)
				console.log("user slug :", userData?.slug);
				currentPage = new Game(userData!.slug);
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