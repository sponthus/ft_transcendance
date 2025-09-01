import { navigate } from '../core/router.js';
import { State } from "../core/state.js";
import { getUserInfo, modifyUserAvatar , modifyUserInfo } from "../api/user.js";
import { createDiv, createElement, append, createAnchorElement, createImage } from '../Utils/elementMaker.js';

const wrapper: HTMLElement = createDiv('wrapper' ,'grid grid-cols-3 items-center justify-between p-4 bg-orange-200 shadow-md h-[10%] w-full min-w-[800px]');
const userInfo: HTMLElement = createDiv('user-info',  'flex flex-wrap order-1 text-sm text-gray-600');
const logo: HTMLElement = createDiv('logo',  'mx-auto order-2 snap-center');
const navLinks: HTMLUListElement = createElement('ul', 'nav-links', "", 'flex justify-end space-x-4 order-3 list-none') as HTMLUListElement;

const state = State.getInstance();

/*************************************export Functions for creatin banner*************************************/
export function renderBaseBanner(banner: HTMLElement): void {
	banner.innerHTML = '';
	initLogo();
	addInBanner(banner);
}

export async function renderLoggedOutBanner(banner: HTMLElement): Promise<void> {
	if (!checkLogoutElement(banner)) {
		return;
	}
	setLogoutUserInfo();
	createItem('/login', 'Login', 'px-4 py-2 text-emerald-600  hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors');
	createItem('/register', 'Register', 'px-4 py-2 bg-emerald-600 text-green-200 hover:bg-emerald-800 rounded-md transition-colors');
}

export async function renderLoggedInBanner(banner: HTMLElement): Promise<void> {
	if (!checkLoginElement(banner)) {
		return;
	}

	setLoginUserInfo();
	createItem('/setting', "Settings", "px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors");
	createItem(`/user/${state.user?.slug}`, 'Profile', 'px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors');
	createItem('/', 'Logout', 'px-4 py-2 text-red-200 bg-red-600 hover:text-red-300 hover:bg-red-800 rounded-md transition-colors cursor-pointer');
	SetLogOutEvent();
}

/*************************************Function for creating Base Banner*************************************/

function initLogo() {
	const logoLink = createAnchorElement('logo-link', "", "/", 'text-2xl font-bold text-emerald-400 hover:text-emerald-800 transition-colors') as HTMLAnchorElement;
	append(logoLink, [(createImage("logo", "mx-auto object-cover rounded-full hover:bg-emerald-600 object-center h-12 w-18", "/logo/logoIlsandWorld.png") as HTMLImageElement)])

	append(logo, [logoLink]);
}

/*************************************Function for creating logout Banner*************************************/
function setLogoutUserInfo() {
	userInfo.textContent = 'You are not connected.';
	userInfo.className = 'text-sm text-emerald-600';
}

function checkLogoutElement(banner: HTMLElement): boolean {
	if (!navLinks || !userInfo) {
		if (!navLinks)
			console.log("No nav link");
		if (!userInfo)
			console.log("No user info");
		banner.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
		return false;
	}
	return true;
}

/*************************************Function for creating login Banner*************************************/
function checkLoginElement(banner: HTMLElement): boolean {
	if (!navLinks || !userInfo || !state.isLoggedIn()) {
		if (!navLinks)
			 console.log("No nav link");
		if (!userInfo)
			console.log("No user info");
		if (!state.user) {
			console.log("No user in state");
		}
		banner.innerHTML = '<div class="text-red-500 font-semibold">Error</div>';
		return false;
	}
	return true;
}

function setLoginUserInfo() {
	const usersForm = createDiv('user-div', "flex flex-col text-left text-sm text-emerald-600");
	setTextLoginUserInfo(usersForm);
	setAvatarLoginUserInfo();
	userInfo.appendChild(usersForm);
}

async function setTextLoginUserInfo(usersForm: HTMLElement) {
	try {
		const req = await getUserInfo(state.user?.slug!);
		if (!req.ok) {
			return ;
		}
		const userData = req.user;
		append(usersForm, [(createElement('h1', 'user-state', "online 💚", "") as HTMLElement)
							, (createElement('h1', 'user-name', userData.username, "text-emerald-900"))])
	}
	catch (error) {
		alert(error);
	}
}

function setAvatarLoginUserInfo() {
	const userIconbutton: HTMLAnchorElement = createAnchorElement("user-icon", "", `/user/${state.user?.slug}`, "flex items-center mr-2");
	const userIcon = createDiv("user-icon", "flex items-center justify-center bg-orange-300 hover:bg-orange-400 rounded-full relative w-14 h-14");
	SetUserImg(userIcon);
	append(userIconbutton, [userIcon]);
	append(userInfo, [userIconbutton]);
}

async function SetUserImg(userIcon: HTMLElement) {
	try {
		const req = await getUserInfo(state.user?.slug!);
		if (!req.ok) {
			return ;
		}
		const userData = req.user;
		console.log(`user data = ` + JSON.stringify(userData));
		const avatar: string = userData.avatar;
		const srcImg: string = `https://localhost:4443/uploads/${avatar}`; // problem firefox https autosignate certificate 
		
		append(userIcon, [(createImage('user',"w-12 h-12 rounded-full object-cover object-center", srcImg) as HTMLImageElement)])
	}
	catch (error) {
		alert(error);
	}
}

function SetLogOutEvent() {
	const logoutLink = document.getElementById('Logout-id-a');
	if (!logoutLink)
		return ;
	logoutLink.addEventListener('click', async (e) => {
		e.preventDefault();
		state.logout();
		location.reload();
	});
}

/*************************************Function utils*************************************/
function createItem(href: string, TextContent: string, ClassName: string) {
	const Item: HTMLLIElement = createElement('li', '', '', '') as HTMLLIElement;
	append(Item, [createAnchorElement(TextContent + "-id", TextContent, href, ClassName)]);
	append(navLinks, [Item]);
}

function addInBanner(banner: HTMLElement) {
	append(wrapper, [logo, userInfo, navLinks]);
	append(banner, [wrapper]);
}
