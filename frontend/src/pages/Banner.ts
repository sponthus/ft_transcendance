import { navigate } from '../core/router.js';
// import { modifyUserAvatar , modifyUserInfo } from "../api/user.js";
import { getUserInfo, UserInfo } from '../api/user-service/user-info/getUserInfo.js';
// import { Socket } from '../core/Socket.js';
import { append, createAnchorElement, createButton, createDiv, createImage, createInput, createElement } from '../Utils/elementMaker.js';
import { createSearchBarDiv } from '../Utils/slidingSearch.js';
import { createNotificationDiv } from '../Utils/notification.js';
import { logoutUser } from '../api/user-service/connection/logoutUser.js';
import { log } from 'console';
import { ErrorPopup } from './ErrorPage.js';
import { getUserStatus } from '../api/session-service/getStatus.js';

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
    id: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
};

const wrapper: HTMLElement = createDiv('wrapper', 'grid grid-cols-3 items-center justify-between p-4 bg-orange-200 shadow-md gap-4');
const userInfo: HTMLElement = createDiv('user-info', 'flex flex-wrap order-1 text-sm text-gray-600');
const logo: HTMLElement = createDiv('logo', 'mx-auto order-2 snap-center');
const navLinks: HTMLUListElement = createElement('ul', 'navlinks', '', 'flex justify-end space-x-4 order-3 list-none') as HTMLUListElement;

/*************************************export Functions for creatin banner*************************************/
export function renderBaseBanner(banner: HTMLElement): void {
	banner.innerHTML = '';
	console.log('rendering base banner');
	initLogo();
	addInBanner(banner);
}

export async function renderLoggedOutBanner(banner: HTMLElement): Promise<void> {
	if (!checkLogoutElement(banner)) {
		return;
	}

	setLogoutUserInfo();

	createItem('/login', 'Login', 'px-4 py-2 text-emerald-600  hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105');
	createItem('/register', 'Register', 'px-4 py-2 bg-emerald-600 text-green-200 hover:bg-emerald-800 rounded-md transition-colors rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105');
}

export async function renderLoggedInBanner(banner: HTMLElement, userData: UserInfo): Promise<void> {	
	if (!checkLoginElement(banner)) { //On sait deja que les infos du user existe grace a la requete
		return;
	}
	setLoginUserInfo(userData);

	createSearchBarDiv(navLinks);
	createNotificationDiv(navLinks);
	createItem('/setting', "Settings", "px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105");
	createItem(`/user/${userData.slug}`, 'Profile', 'px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105');
	createItem('/', 'Logout', 'px-4 py-2 text-red-200 bg-red-600 hover:text-red-300 hover:bg-red-800 rounded-md transition-colors cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105');
	SetLogOutEvent();
}

/*************************************Function for creating Base Banner*************************************/

function initLogo() {
	const logoLink: HTMLAnchorElement = createAnchorElement('logo-link', '', '/', 'text-2xl font-bold text-emerald-400 hover:text-emerald-800 transition-colors') as HTMLAnchorElement;
	const logoImg: HTMLImageElement = createImage('logo', 'mx-auto object-cover rounded-full hover:bg-emerald-600 object-center h-12 w-18  hover:shadow-lg transition-all duration-200 transform hover:scale-105', '/logo/logoIlsandWorld.png') as HTMLImageElement;
	// logoLink.innerHTML = `<div id="particle-1" class="particle absolute w-3 h-3 bg-red-400 rounded-full"></div>
	// 						<div id="particle-2" class="particle absolute w-3 h-3 bg-orange-400 rounded-full"></div>
	// 						<div id="particle-3" class="particle absolute w-3 h-3 bg-yellow-400 rounded-full"></div>
	// 						<div id="particle-4" class="particle absolute w-3 h-3 bg-pink-400 rounded-full"></div>`;

	append(logoLink, [logoImg]);
	append(logo, [logoLink]);
}

// function initNavLink() {
// 	navLinks.className = 'flex justify-end space-x-4 order-3 list-none';
// 	navLinks.id = 'nav-links';
// }

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

function setLoginUserInfo(userData: UserInfo) {
	const usersForm = document.createElement('div');
	usersForm.className = "flex flex-col text-left text-sm text-emerald-600";

	setTextLoginUserInfo(usersForm, userData);
	setAvatarLoginUserInfo(userData);

	userInfo.appendChild(usersForm);
}

async function setTextLoginUserInfo(usersForm: HTMLElement, userData: UserInfo) {
	let userSatus: string = 'disconnected 🔴​';
	try {
		const req = await getUserStatus(userData.slug);
		if (!req.ok)
			throw new Error(req.error);
		else {
			if (req.status && req.status.status === "online")
				userSatus = 'online 🟢​';
			if (req.status && req.status.status === "disconnected")
				userSatus = 'disconnected 🔴​';
			if (req.status && req.status.status === "playing")
				userSatus = 'playing 🟡​​';
		}

	} catch(error) {
		await ErrorPopup(error as string);
	}
	append(usersForm, [(createElement('h1', 'user-state', `${userSatus}`, '') as HTMLElement)
						, (createElement('h1', 'user-name', `${userData.username}`, 'text-emerald-900') as HTMLElement)]);
}

function setAvatarLoginUserInfo(userData: UserInfo) {
	const userIconbutton: HTMLAnchorElement = createAnchorElement('user-icon', '', `/user/${userData.slug}`, 'flex items-center mr-2');

	const userIcon: HTMLElement = createDiv('user-icon', 'flex items-center justify-center bg-orange-300 hover:bg-orange-400 rounded-full relative shadow-xl w-14 h-14 hover:shadow-lg transition-all duration-200 transform hover:scale-105')

	SetUserImg(userIcon, userData);

	userIconbutton.appendChild(userIcon);

	userInfo.appendChild(userIconbutton);
}

async function SetUserImg(userIcon: HTMLElement, userData: UserInfo) {
	console.log(`user data = ` + JSON.stringify(userData));
	const avatar: string = userData.avatar;
	const srcImg: string = `https://localhost:4443/uploads/${avatar}`;

	append(userIcon, [(createImage('user', 'w-12 h-12 rounded-full object-cover object-center', srcImg) as HTMLImageElement)]);
}

function SetLogOutEvent() {
	const logoutLink = document.getElementById('Logout_id');
	if (!logoutLink)
		return ;
	logoutLink.addEventListener('click', async (e) => {
		e.preventDefault();
		await logoutUser();
	//	socket.close();
		navigate('/');
		location.reload();
	});
}

/*************************************Function utils*************************************/
function createItem(href: string, TextContent: string, ClassName: string) {
	const Item = document.createElement('li');
	const Link = document.createElement('a');
	Link.id = TextContent + "_id";
	Link.href = href;
	Link.textContent = TextContent;
	Link.className = ClassName;
	Item.appendChild(Link);

	navLinks.append(Link);
}

function addInBanner(banner: HTMLElement) {
	wrapper.appendChild(logo);
	wrapper.appendChild(userInfo);
	wrapper.appendChild(navLinks);

	banner.appendChild(wrapper);
	updateResize();
}

export function updateResize() {
	if (window.innerWidth <= 1258)
		logo.classList.add('hidden');
	else
		logo.classList.remove('hidden');
	if (window.innerWidth <= 858)
		navLinks.classList.add('hidden');
	else
		navLinks.classList.remove('hidden');
}
