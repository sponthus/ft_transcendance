import { append, createDiv, createButton, createImage, createAnchorElement } from "./elementMaker";


const notificationWrapper: HTMLElement = createDiv('notif-wrapper','relative flex items-center');
let isNotificationOpen: boolean = false;

export function createNotificationDiv(parent: HTMLElement) {

	append(notificationWrapper, [createNotificationToggle(), createSlidingNotificationPan()]);
	append(parent, [notificationWrapper]);

	toggleNotification();
	eventCloseSearch();
	acceptInvitation();
	declineInvitation();
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

function acceptInvitation() {
	for (let i = 0; i < 3; i++) {
		(document.getElementById(`accept-${i}-btn`) as HTMLButtonElement).addEventListener('click', (e) => {
			e.stopPropagation();
			e.preventDefault();
		})
	}
}

function declineInvitation() {
	for (let i = 0; i < 3; i++) {
		(document.getElementById(`decline-${i}-btn`) as HTMLButtonElement).addEventListener('click', (e) => {
			e.stopPropagation();
			e.preventDefault();
		})
	}
}

function openNotification() {
	isNotificationOpen = true;
	
	(document.getElementById('sliding-notification-bar-div') as HTMLElement).className = 'absolute left-0 top-16 w-80 h-72 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-100';
	
	// const notificationPannel = document.getElementById('notification-panel-div') as HTMLElement;
	// setTimeout(() => {
	// 	notificationPannel.className = "w-64 px-4 text-sm border-0 rounded-xl bg-transparent focus:outline-none opacity-100 transition-opacity duration-300'";
	// 	notificationPannel.focus();
	// }, 150);
}

function closeNotification() {
	isNotificationOpen = false;

	(document.getElementById('sliding-notification-bar-div') as HTMLElement).className = 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0';

	// const notificationPannel = document.getElementById('notification-panel-div') as HTMLElement;
	// setTimeout(() => {
	// 	notificationPannel.className = "w-64 px-4 text-sm border-0 rounded-xl bg-transparent focus:outline-none opacity-0 transition-opacity duration-300'";
	// 	notificationPannel.focus();
	// }, 150);
}

function createSlidingNotificationPan(): HTMLElement {
	const slidingotificationPan = createDiv('sliding-notification-bar', 'absolute left-0 top-16 w-0 h-0 overflow-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0')

	// const notificationPannel = createDiv('notification-panel', 'w-64 px-4 text-sm border-0 rounded-xl bg-transparent focus:outline-none opacity-0 transition-opacity duration-300');

	for (let i = 0; i < 4; i++) {
		append(slidingotificationPan,[addInvitation(i)]);
	}

	// append(slidingotificationPan, [notificationPannel]);
	return slidingotificationPan;
}

function addInvitation(index: number) : HTMLAnchorElement {
	const InvitationDiv: HTMLAnchorElement = createAnchorElement(`notification-${index}`, '', '/', 'group flex items-center justify between w-full h-24 hover:bg-orange-200 space-x-4 shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform') 

	const userIcon: HTMLElement = createDiv(`user-notification-icon-${index}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl w-14 h-14 group-hover:shadow-lg transition-all duration-200 transform');

	append(userIcon, [(createImage(`user-notification-${index}`, 'w-12 h-12 rounded-full object-cover object-center',  `https://localhost:4443/uploads/default.jpg`) as HTMLImageElement)]);

	const invitationTextDiv = createDiv(`invitation-text-${index}`, 'flex flex-col items-center');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">user ${index} has send you an invitation</p>`;

	const btnDiv = createDiv(`btn-invitation-${index}`, 'fles items-center justify-between space-x-8') as HTMLElement;

	append(btnDiv, [(createButton(`accept-${index}`, 'px-4 text-orange-100 bg-emerald-600 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-emerald-700 transition-all duration-200', 'accept') as HTMLButtonElement)
								, (createButton(`decline-${index}`, 'px-4 text-orange-100 bg-red-500 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-red-600 transition-all duration-200', 'decline') as HTMLButtonElement)	]);
	append(invitationTextDiv, [btnDiv]);

	append(InvitationDiv, [userIcon, invitationTextDiv]);

	return InvitationDiv;
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

	// if notifictaion
	const numberNotification = createDiv('', 'flex items-center justify-center rounded-full h-8 w-8 border-2 border-orange-200 absolute top-6 left-6 bg-emerald-600 group-hover:bg-emerald-700 text-orange-200 group-hover:text-orange-300 animate-bounce duration-100') as HTMLElement;
	numberNotification.innerHTML = `
	<h1>4</h1>`; // add real number of notification

	append(NotificationToggle, [numberNotification]);
	return NotificationToggle;
}