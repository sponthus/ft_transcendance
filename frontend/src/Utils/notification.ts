import { acceptRequest, getReceivedRequests, rejectRequest } from "../api/user-service/menu/friendsList/requestHandlers";
import { getUserInfoBySlug, UserInfo } from "../api/user-service/user-info/getUserInfo";
import { append, createDiv, createButton, createImage, createAnchorElement } from "./elementMaker";
import { getAllNotifications, AllNotifs, getReadNotifications, getUnreadNotifications } from "../api/user-service/menu/notifications/getNotifications";
import { markNotificationsRead } from "../api/user-service/menu/notifications/markNotificationRead";
import { ErrorPopup } from "../pages/ErrorPage";

const notificationWrapper: HTMLElement = createDiv('notif-wrapper','relative flex items-center');
let isNotificationOpen: boolean = false;
let ReceiveRequest: AllNotifs[];
let userData: UserInfo;
let readNotification: number;

export function createNotificationDiv(parent: HTMLElement) {

	append(notificationWrapper, [createNotificationToggle(), createSlidingNotificationPan()]);
	append(parent, [notificationWrapper]);

	toggleNotification();
	eventCloseSearch();
}

function toggleNotification() {
	(document.getElementById('notification-toggle-btn') as HTMLButtonElement).addEventListener('click', () => {
		if (isNotificationOpen)
			closeNotification();
		else
			openNotification();
	})
}

function eventCloseSearch() {
	document.addEventListener('click', (e) => {
		if (isNotificationOpen && !notificationWrapper.contains(e.target as Node)) {
			closeNotification();
		}
	});
}

function acceptInvitation(acceptBtn: HTMLButtonElement, userData: UserInfo) {
	console.log("acctp invitation of called for ", userData.username);
	acceptBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();	
		try {
			const req = await acceptRequest(userData.username);
			if (req.ok) {
				ErrorPopup("accept invitation of " + userData.username);
				console.log("acctp invitation of ", userData.username);
				refreshNotification();
			}

		} catch(error) {
			ErrorPopup(error as string);
		}
	})
}

function declineInvitation(declineBtn: HTMLButtonElement, userData: UserInfo) {
	console.log("acctp invitation of called for ", userData.username);
	declineBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();	
		try {
			const req = await rejectRequest(userData.username);
			if (req.ok) {
				ErrorPopup("decline invitation of " + userData.username);
				console.log("acctp invitation of ", userData.username);
				refreshNotification();
			}

		}catch(error) {
			ErrorPopup(error as string);
		}
	})
}

async function openNotification() {
	isNotificationOpen = true;

	(document.getElementById('sliding-notification-bar-div') as HTMLElement).className = 'absolute left-0 top-16 w-80 h-72 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-500 opacity-100';
	
	try {
		const req = await markNotificationsRead();
		if (req.ok)
		return ; 
	} catch(error) {
		ErrorPopup(error as string);
	}
	// const notificationPannel = document.getElementById('notification-panel-div') as HTMLElement;
	// setTimeout(() => {
	// 	notificationPannel.className = "w-64 px-4 text-sm border-0 rounded-xl bg-transparent focus:outline-none opacity-100 transition-opacity duration-300'";
	// 	notificationPannel.focus();
	// }, 150);
}

async function closeNotification() {
	isNotificationOpen = false;

	(document.getElementById('sliding-notification-bar-div') as HTMLElement).className = 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0';

	refreshNotification() ; 
	// const notificationPannel = document.getElementById('notification-panel-div') as HTMLElement;
	// setTimeout(() => {
	// 	notificationPannel.className = "w-64 px-4 text-sm border-0 rounded-xl bg-transparent focus:outline-none opacity-0 transition-opacity duration-300'";
	// 	notificationPannel.focus();
	// }, 150);
}

function createSlidingNotificationPan(): HTMLElement {
	const slidingotificationPan = createDiv('sliding-notification-bar', 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0')

	fillReceiveRequest(slidingotificationPan);

	return slidingotificationPan;
}

async function fillUSerInfo(request: AllNotifs, parent: HTMLElement){
	try {
		const req = await getUserInfoBySlug(request.username); // replace by slug
		if (req.ok) {
			userData = req.userInfo;
			console.log("request is  = ", request.notif_type);
			if (request.notif_type === "friend_request")
				append(parent ,[addInvitation(userData)]);
			else if (request.notif_type === "friend_accept")
				append(parent, [addAcceptRequest(userData)]);
			else if (request.notif_type === "friend_reject")
				append(parent, [addREjectRequest(userData)]);
		}
	} catch (error) {
		ErrorPopup(error as string);
	}
	addNumberInvitation();
}

async function fillReceiveRequest(parent: HTMLElement) {
	try {
		const reqRead = await getUnreadNotifications();
		if (reqRead.ok) {
			const read: AllNotifs[] = reqRead.notifs;
			console.log("value of readrequest ", read);
			readNotification = read.length;
		}
		const req = await getAllNotifications();
		if (req.ok) {
			ReceiveRequest = req.notifs;
			ReceiveRequest.forEach(request => {
				fillUSerInfo(request, parent);
				console.log("value of request ", request);
			})
		}
		
	} catch (error) {
		ErrorPopup(error as string);
	}
}

function addUSerData(userData: UserInfo, parent: HTMLAnchorElement, textContent: string) {
	const userIcon: HTMLElement = createDiv(`user-notification-icon-${userData.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');

	append(userIcon, [(createImage(`user-notification-${userData.slug}`, 'w-12 h-12 rounded-full object-cover object-center',  `https://localhost:4443/uploads/${userData.avatar}`) as HTMLImageElement)]);

	const invitationTextDiv = createDiv(`invitation-text-${userData.slug}`, 'flex flex-col items-center');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">${textContent}</p>`;

	append(parent, [userIcon, invitationTextDiv]);
}

function addInvitation(userdata: UserInfo) : HTMLAnchorElement {
	// TODO Emma : I had a bug here where userData was undefined ? Impossible to recreate it but be careful
	const InvitationDiv: HTMLAnchorElement = createAnchorElement(`notification-${userdata.slug}`, '', `/user/${userData.slug}`, 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');

	const userIcon: HTMLElement = createDiv(`user-notification-icon-${userdata.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');

	append(userIcon, [(createImage(`user-notification-${userdata.slug}`, 'w-12 h-12 rounded-full object-cover object-center',  `https://localhost:4443/uploads/${userdata.avatar}`) as HTMLImageElement)]);

	const invitationTextDiv = createDiv(`invitation-text-${userdata.slug}`, 'flex flex-col items-center');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">user ${userdata.username} has send you an invitation</p>`;

	const btnDiv = createDiv(`btn-invitation-${userdata.slug}`, 'flex items-center justify-between space-x-8') as HTMLElement;

	let accept: HTMLButtonElement= (createButton(`accept-${userdata.slug}`, 'px-4 text-orange-100 bg-emerald-600 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-emerald-700 transition-all duration-200', 'accept') as HTMLButtonElement);
	let decline: HTMLButtonElement = (createButton(`decline-${userdata.slug}`, 'px-4 text-orange-100 bg-red-500 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-red-600 transition-all duration-200', 'decline') as HTMLButtonElement);
	append(btnDiv, [accept, decline]);
	append(invitationTextDiv, [btnDiv]);
	
	append(InvitationDiv, [userIcon, invitationTextDiv]);

	acceptInvitation(accept, userData);
	declineInvitation(decline, userData);

	return InvitationDiv;
}

function addAcceptRequest(userdata: UserInfo): HTMLAnchorElement {
	const acceptDiv: HTMLAnchorElement = createAnchorElement(`notification-${userdata.slug}`, '', `/user/${userData.slug}`, 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');;
	
	addUSerData(userData, acceptDiv, `user ${userData.username} accept your friend request`);
	return acceptDiv;
}

function addREjectRequest(userdata: UserInfo): HTMLAnchorElement {
	const rejectDiv :HTMLAnchorElement = createAnchorElement(`notification-${userdata.slug}`, '', `/user/${userData.slug}`, 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');;
	
	addUSerData(userData, rejectDiv, `user ${userData.username} decline your friend request`);
	return rejectDiv;
}

function createNotificationToggle(): HTMLElement {
	const NotificationToggle: HTMLButtonElement = createButton('notification-toggle', 'group flex items-center justify-center w-10 h-10 bg-orange-200 hover:bg-orange-300 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105', 'search');
	// searchToggle.title = 'search';

	NotificationToggle.innerHTML = `
		<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"d="M15 17h5l-1.405-1.405A2.032 2.032
																						0 0118 14.158V11a6.002 6.002
																						0 00-4-5.659V5a2 2 0 10-4
																						0v.341C8.67 6.165 8 7.388
																						8 8.75V11c0 .415-.163.816-.455
																						1.11L6 13.5V17h5m4 0v1a3 3
																						0 11-6 0v-1m6 0H9""></path>
		</svg>
	`;

	return NotificationToggle;
}

async function addNumberInvitation() {
	console.log("res request = ", ReceiveRequest);
	if (!readNotification || readNotification === 0)
			return ;
	const NotificationToggle: HTMLButtonElement = (document.getElementById('notification-toggle-btn') as HTMLButtonElement);

	const numberNotification = createDiv('', 'flex items-center justify-center rounded-full h-8 w-8 border-2 border-orange-200 absolute top-6 left-6 bg-emerald-600 group-hover:bg-emerald-700 text-orange-200 group-hover:text-orange-300 animate-bounce duration-100') as HTMLElement;
	numberNotification.innerHTML = `
	<h1>${readNotification}</h1>`;

	append(NotificationToggle, [numberNotification]);
}

export function refreshNotification() {
	Array.from(notificationWrapper.children).forEach(child => {
		Array.from(child.children).forEach(children => {child.removeChild(children);});
		notificationWrapper.removeChild(child);});

	append(notificationWrapper, [createNotificationToggle(), createSlidingNotificationPan()]);
	toggleNotification();
	eventCloseSearch();
}