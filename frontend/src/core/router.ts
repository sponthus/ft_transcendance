import { Game } from "../babylon/main.js"
import { BasePage } from '../pages/BasePage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { SettingPage } from "../pages/setting-page/SettingPage.js";
import { UserPage } from '../pages/User-Pages/UserPage.js';
import { getUserInfo } from "../api/user-service/user-info/getUserInfo.js";

let currentPage: BasePage | null = null;

export async function renderRoute(path: string) {
    currentPage?.destroy();
    let userData;
    const req = await getUserInfo(); //Est-ce que je peux y mettre en appel en amont pour eviter une surchage de call API ?
    if (req.ok)
        userData = req.userInfo;
    else {
		if (req.error === "No token found")
			userData = null;
	}
    /*else {
        alert("PAS DE USER INFO DANS ROUTER, PAS POSSIBLE NORMALEMENT");//a enlever
    }*/ //router est appeler a chaque fois du coup le message s'affiche a chaque page

	let dynamicPart = '';
    // Dynamic routes
    if (path.startsWith('/user/')) {
        console.log("before navigation" + userData?.username);
        dynamicPart = path.slice('/user/'.length);
		path = '/user';
    }

    console.log("before navigation" + userData?.username);
	// Static routes
	switch (path) {
		case '/':
			currentPage = new HomePage();
			break;
		case '/login':
			if (userData) {
				await navigate('/');
				return ;
			}
			currentPage = new LoginPage();
			break;
		case '/register':
			if (userData) {
				await navigate('/');
				return ;
			}
			currentPage = new RegisterPage();
			break;
		case '/game':
			if (!userData) {
				await navigate('/login');
				return ;
			}
			console.log("state user :", userData)
			console.log("user slug :", userData?.slug);
			currentPage = new Game(userData!.slug);
			// currentPage = new LocalGamePage();
			break;
		case '/user':
			if (!userData) {
				await navigate('/login');
				return ;
			}
			if (!dynamicPart) {
				await navigate(`/user/${userData.slug}`);
				return ;
			}
			console.log('dynamiquepart' , dynamicPart);
			currentPage = new UserPage(dynamicPart);
			break;
		case '/setting':
			if (!userData) {
				await navigate('/login');
				return ;
			}
			currentPage = new SettingPage();
			break;
		default:
			break;
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
	location.reload();
    await renderRoute(path);
}

export async function setupRouter() {
	console.log("router setup");

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