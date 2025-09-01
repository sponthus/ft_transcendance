import { navigate } from '../core/router.js';
//import { State } from "../core/state.js";
import { modifyUserAvatar , modifyUserInfo } from "../api/user.js";
import { getUserInfo } from '../api/user-service/user-info/getUserInfo.js';
import { Socket } from '../core/Socket.js';

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
    id: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
};

const wrapper = document.createElement('div');
const userInfo = document.createElement('div');
const logo = document.createElement('div');
const navLinks = document.createElement('ul');

//const socket = Socket.getInstance(-1);

/*************************************export Functions for creatin banner*************************************/
export function renderBaseBanner(banner: HTMLElement): void {
	banner.innerHTML = '';
	console.log('coucou');
	initWrapper();
	initUserInfo();
	initLogo();
	initNavLink();
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

export async function renderLoggedInBanner(banner: HTMLElement, userData: UserData): Promise<void> {	
	if (!checkLoginElement(banner)) { //On sait deja que les infos du user existe grace a la requete
		return;
	}
	setLoginUserInfo(userData);

	createItem('/setting', "Settings", "px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors");
	createItem(`/user/${userData.slug}`, 'Profile', 'px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-orange-300 rounded-md transition-colors');
	createItem('/', 'Logout', 'px-4 py-2 text-red-200 bg-red-600 hover:text-red-300 hover:bg-red-800 rounded-md transition-colors cursor-pointer');

	SetLogOutEvent();
}

/*************************************Function for creating Base Banner*************************************/
function initWrapper() {
	wrapper.className = 'grid grid-cols-3 items-center justify-between p-4 bg-orange-200 shadow-md';
}

function initUserInfo() {
	userInfo.className = 'flex flex-wrap order-1 text-sm text-gray-600';
	userInfo.id = 'user-info';
}

function initLogo() {
	logo.className = 'mx-auto order-2 snap-center'

	const logoLink = document.createElement('a');
	logoLink.href = '/';
	logoLink.className = 'text-2xl font-bold text-emerald-400 hover:text-emerald-800 transition-colors'
		
	const logoImg = document.createElement('img');
	logoImg.className = "mx-auto object-cover rounded-full hover:bg-emerald-600 object-center h-12 w-18";
	logoImg.src = "/logo/logoIlsandWorld.png";

	logoLink.appendChild(logoImg);
	logo.appendChild(logoLink);
}

function initNavLink() {
	navLinks.className = 'flex justify-end space-x-4 order-3 list-none';
	navLinks.id = 'nav-links';
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

function setLoginUserInfo(userData: UserData) {
	const usersForm = document.createElement('div');
	usersForm.className = "flex flex-col text-left text-sm text-emerald-600";

	setTextLoginUserInfo(usersForm, userData);
	setAvatarLoginUserInfo(userData);

	userInfo.appendChild(usersForm);
}

async function setTextLoginUserInfo(usersForm: HTMLElement, userData: UserData) {

	const userState = document.createElement('h1');
	userState.id = "user-state";
	userState.className = "";
	userState.textContent = "online 💚"; //  call API

	const userName = document.createElement('h1');
	userName.id = "user-name";
	userName.className = "text-emerald-900";
	userName.textContent = userData.username;

	usersForm.appendChild(userState);
	usersForm.appendChild(userName);
}

function setAvatarLoginUserInfo(userData: UserData) {
	const userIconbutton = document.createElement('a') as HTMLAnchorElement;
	userIconbutton.href = `/user/${userData.slug}`;
	userIconbutton.className = "flex items-center mr-2";

	const userIcon = document.createElement('div');
	userIcon.className = "flex items-center justify-center bg-orange-300 hover:bg-orange-400 rounded-full relative w-14 h-14";

	SetUserImg(userIcon, userData);

	userIconbutton.appendChild(userIcon);

	userInfo.appendChild(userIconbutton);
}

async function SetUserImg(userIcon: HTMLElement, userData: UserData) {
	console.log(`user data = ` + JSON.stringify(userData));
	const avatar: string = userData.avatar;
	const srcImg: string = `https://localhost:4443/uploads/${avatar}`; // problem firefox https autosignate certificate 

	const userImg = document.createElement('img');
	userImg.id = "user-img";
	userImg.className = "w-12 h-12 rounded-full object-cover object-center";
	userImg.src = srcImg;

	userIcon.appendChild(userImg);
}

function SetLogOutEvent() {
	const logoutLink = document.getElementById('Logout_id');
	if (!logoutLink)
		return ;
	logoutLink.addEventListener('click', async (e) => {
		e.preventDefault();
		localStorage.removeItem("token");
	//	socket.close();
	//	state.logout();
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
}
