import { append, createDiv, createButton } from "./elementMaker";

const notificationWrapper: HTMLElement = createDiv('notif-wrapper','relative flex items-center');

export function createNotificationDiv(parent: HTMLElement) {

	append(notificationWrapper, [createNotificationToggle(), createSlidingNotificationPan()]);
	append(parent, [notificationWrapper]);
}

function createSlidingNotificationPan(): HTMLElement {
	const slidingotificationPan = createDiv('sliding-search-bar', 'absolute right-0 top-0 w-0 overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-full shadow-lg')

	return slidingotificationPan;
}

function createNotificationToggle(): HTMLElement {
	const NotificationToggle: HTMLButtonElement = createButton('notification-toggle', 'flex items-center justify-center w-10 h-10 bg-orange-200 hover:bg-orange-300 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105', 'search');
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