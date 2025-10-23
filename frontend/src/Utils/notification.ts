import { acceptRequest, rejectRequest } from "../api/user-service/menu/friendsList/requestHandlers";
import { getUserInfoBySlug, UserInfo } from "../api/user-service/user-info/getUserInfo";
import { append, createDiv, createButton, createImage, createAnchorElement } from "./elementMaker";
import { getAllNotifications, AllNotifs, getUnreadNotifications } from "../api/user-service/menu/notifications/getNotifications";
import { markNotificationsRead } from "../api/user-service/menu/notifications/markNotificationRead";
import { ErrorPopup } from "../pages/ErrorPage";
import { answerTournament } from "../api/user-service/menu/notifications/tournaments";
import { currentPage, WebPath } from "../core/router";

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
	const btn: HTMLButtonElement = (document.getElementById('notification-toggle-btn') as HTMLButtonElement);
	if (btn) {
		btn.addEventListener('click', () => {
			if (isNotificationOpen)
				closeNotification();
			else
				openNotification();
		})
	}
}

function eventCloseSearch() {
	document.addEventListener('click', (e) => {
		if (isNotificationOpen && !notificationWrapper.contains(e.target as Node)) {
			closeNotification();
		}
	});
}

function acceptFriendInvitation(acceptBtn: HTMLButtonElement, userData: UserInfo) {
	if (!acceptBtn)
		return;
	acceptBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();	
		try {
			const req = await acceptRequest(userData.slug);
			if (req.ok) {
				if (currentPage && WebPath && WebPath.startsWith('/user'))
					currentPage.render();
				else
					refreshNotification();
			}
			else
				throw new Error(req.error);
		} catch(error) {
			await ErrorPopup(error as string);
		}
	})
}

export function acceptTournamentinvitation(acceptBtn: HTMLButtonElement, tournament: AllNotifs) {
	if (!acceptBtn)
		return;
	acceptBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();
		try {
			const req = await answerTournament(tournament.slug, tournament.notif_tournament_id, tournament.notif_tournament_name, "accept");
			if (req.ok) {
				if (currentPage && WebPath && WebPath.startsWith('/user'))
					currentPage.render();
				else			
					refreshNotification();
			}
			else
				throw new Error(req.error);
		} catch(error) {
			await ErrorPopup(error as string);
		}
	})
}

function declineFriendInvitation(declineBtn: HTMLButtonElement, userData: UserInfo) {
	if (!declineBtn)
		return;
	declineBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();	
		try {
			const req = await rejectRequest(userData.slug);
			if (req.ok)
				refreshNotification();
			else
				throw new Error(req.error);

		} catch(error) {
			await ErrorPopup(error as string);
		}
	})
}

export function declineTournamentInvitation(declineBtn: HTMLButtonElement, tournament: AllNotifs) {
	if (!declineBtn)
		return;
	declineBtn.addEventListener('click', async(e) => {
		e.stopPropagation();
		e.preventDefault();
		try {
			const req = await answerTournament(tournament.slug, tournament.notif_tournament_id, tournament.notif_tournament_name, "decline");
			if (req.ok) {
				refreshNotification();
			}
			else 
				throw new Error(req.error);						
		} catch (error) {
			await ErrorPopup(error as string);
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
		else
			throw new Error(req.error);
	} catch(error) {
		await ErrorPopup(error as string);
	}
}

async function closeNotification() {
	isNotificationOpen = false;

	(document.getElementById('sliding-notification-bar-div') as HTMLElement).className = 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0';

	refreshNotification();
}

function createSlidingNotificationPan(): HTMLElement {
	const slidingotificationPan = createDiv('sliding-notification-bar', 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0')

	fillReceiveRequest(slidingotificationPan);

	return slidingotificationPan;
}

async function fillUSerInfo(request: AllNotifs, parent: HTMLElement){
	try {
		const req = await getUserInfoBySlug(request.slug); // replace by slug
		if (req.ok) {
			userData = req.userInfo;
			if (request.notif_type === "friend_request" && userData)
				append(parent ,[addInvitation(userData, null)]);
			else if (request.notif_type === "friend_accept" && userData)
				append(parent, [addRequest(userData, `User ${userData.username} accept your friend request`)]);
			else if (request.notif_type === "friend_reject" && userData)
				append(parent, [addRequest(userData, `User ${userData.username} accept your friend request`)]);
			else if (request.notif_type === "tournament_invite" && userData)
				append(parent ,[addInvitation(userData, request)]);
			else if (request.notif_type === "tournament_ready" && userData)
				append(parent, [addRequest(userData, `Tournament ${request.notif_tournament_name} is ready to play`)]);
			else if (request.notif_type === "tournament_accept" && userData)
				append(parent, [addRequest(userData, `User ${userData.username} accept to play tournament ${request.notif_tournament_name}`)]);
			else if (request.notif_type === "tournament_cancel" && userData)
				append(parent, [addRequest(userData, `Tournament ${request.notif_tournament_name} has been canceled`)]);
		}
		else
			throw new Error(req.error);
	} catch (error) {
		await ErrorPopup(error as string);
	}
	addNumberInvitation();
}

async function fillReceiveRequest(parent: HTMLElement) {
	try {
		const reqRead = await getUnreadNotifications();
		if (reqRead.ok) {
			const read: AllNotifs[] = reqRead.notifs;
			readNotification = read.length;
		}
		else
			throw new Error(reqRead.error); 
		const req = await getAllNotifications();
		if (req.ok) {
			ReceiveRequest = req.notifs;
			ReceiveRequest.forEach(request => {
				fillUSerInfo(request, parent);
			})
		}
		else
			throw new Error(req.error);
		
	} catch (error) {
		await ErrorPopup(error as string);
	}
}

function addUSerData(userData: UserInfo, parent: HTMLAnchorElement, textContent: string) {
	const userIcon: HTMLElement = createDiv(`user-notification-icon-${userData.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl w-[20%] aspect-square group-hover:shadow-lg transition-all duration-200 transform');

	const srcImg = `https://${window.location.hostname}:4443/uploads/${userData.avatar}`;
	
	append(userIcon, [(createImage(`user-notification-${userData.slug}`, ' w-[90%] aspect-square rounded-full object-cover object-center', `${srcImg}?t=${Date.now()}`) as HTMLImageElement)]);

	const invitationTextDiv = createDiv(`invitation-text-${userData.slug}`, 'flex flex-col items-center');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">${textContent}</p>`;

	append(parent, [userIcon, invitationTextDiv]);
}

function addInvitation(userdata: UserInfo, tournament: AllNotifs | null) : HTMLAnchorElement {
	const InvitationDiv: HTMLAnchorElement = createAnchorElement(`notification-${userdata.slug}`, '', `/user/${userData.slug}`, 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');

	const srcImg = `https://${window.location.hostname}:4443/uploads/${userdata.avatar}`;
	const userIcon: HTMLElement = createDiv(`user-notification-icon-${userdata.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl w-[30%] aspect-square group-hover:shadow-lg transition-all duration-200 transform');

	append(userIcon, [(createImage(`user-notification-${userdata.slug}`, 'w-[90%] aspect-square rounded-full object-cover object-center',  `${srcImg}?t=${Date.now()}`) as HTMLImageElement)]);

	let msg: string = `User ${userdata.username} has sent you a friend invitation`;
	if (tournament)
		msg = `User ${userdata.username} invited you to play tournament ${tournament.notif_tournament_name}`
	const invitationTextDiv = createDiv(`invitation-text-${userdata.slug}`, 'flex flex-col items-center');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">${msg}</p>`;

	const btnDiv = createDiv(`btn-invitation-${userdata.slug}`, 'flex items-center justify-between space-x-8') as HTMLElement;

	let accept: HTMLButtonElement= (createButton(`accept-${userdata.slug}`, 'px-4 text-orange-100 bg-emerald-600 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-emerald-700 transition-all duration-200', 'accept') as HTMLButtonElement);
	let decline: HTMLButtonElement = (createButton(`decline-${userdata.slug}`, 'px-4 text-orange-100 bg-red-500 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-red-600 transition-all duration-200', 'decline') as HTMLButtonElement);
	append(btnDiv, [accept, decline]);
	append(invitationTextDiv, [btnDiv]);
	
	append(InvitationDiv, [userIcon, invitationTextDiv]);

	if (tournament) {
		acceptTournamentinvitation(accept, tournament);
		declineTournamentInvitation(decline, tournament);
	}
	else {
		acceptFriendInvitation(accept, userData);
		declineFriendInvitation(decline, userData);
	}

	return InvitationDiv;
}

function addRequest(userdata: UserInfo, msg: string): HTMLAnchorElement {
	const acceptDiv: HTMLAnchorElement = createAnchorElement(`notification-${userdata.slug}`, '', `/user/${userData.slug}`, 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');;
	addUSerData(userData, acceptDiv, `${msg}`);
	return acceptDiv;
}

function createNotificationToggle(): HTMLElement {
	const NotificationToggle: HTMLButtonElement = createButton('notification-toggle', 'group flex items-center justify-center w-10 h-10 bg-orange-200 hover:bg-orange-300 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105  active:scale-95', 'search');

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
		Array.from(child.children).forEach(children => {children.remove();});
		child.remove();});

	append(notificationWrapper, [createNotificationToggle(), createSlidingNotificationPan()]);
	toggleNotification();
	eventCloseSearch();
}