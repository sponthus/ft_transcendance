import { createDiv, append, createInput, createButton, createAnchorElement } from "./elementMaker";
import { navigate } from "../core/router";
import { getAllUsers, AllUsers } from "../api/user-service/menu/getAllUsers";
import { ErrorPopup } from "../pages/ErrorPage";

let isSearchOpen: boolean = false;
const searchWrapper: HTMLElement = createDiv("search-wrapper", 'relative flex items-center');
const searchPanel : HTMLElement = createDiv('search-panel', 'flex flex-col items-center space-y-4 absolute right-0 top-16 w-0 h-0 overflow-y-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0');
let isOpen :boolean = false;
let UserTab: AllUsers[] = [];

let _eventListener: ((e: Event) => void) | null = null;
let _eventListenerAttached: boolean = false;

/*************************************functions for creating search button*************************************/
export function createSearchBarDiv(parent :HTMLElement) {

	append(searchWrapper, [createSearchToggle(), createSlidingSearchBar()]);

	parent.appendChild(searchWrapper);
	searchWrapper.appendChild(searchPanel);
	manageSearchBarEvent();
}

function createSlidingSearchBar() : HTMLElement {
	const slidingSearchBar = createDiv('sliding-search-bar', 'absolute right-0 top-0 w-0 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg')

	const searchInput: HTMLInputElement = createInput(['text', 'search', 'search user...', true], 'search', 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-0 transition-opacity duration-300');

	const closeButton = createDiv('close-btn', 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-0 transition-opacity duration-300  active:scale-95');
	closeButton.innerHTML = `
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	`;

	append(slidingSearchBar, [searchInput, closeButton])

	return slidingSearchBar;
}

function createSearchToggle(): HTMLButtonElement {

	const searchToggle: HTMLButtonElement = createButton('search-toggle', 'flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105  active:scale-95', 'search');
	searchToggle.innerHTML = `
		<svg class="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		</svg>
	`;

	return searchToggle;
}

function manageSearchBarEvent() {
	const toggle = (document.getElementById("search-toggle-btn") as HTMLButtonElement);
	const close = (document.getElementById('close-btn-div') as HTMLElement)
	if (toggle) {
		toggle.addEventListener('click', toggleSearch);
	}
	if (close) {
		close.addEventListener('click', closeSearch);
	}
	handleSearchEnter();
	eventCloseSearch();
}

function handleSearchEnter() {
	const input = (document.getElementById("search-input") as HTMLInputElement)
	if (!input)
		return ;
	input.addEventListener('keydown', (e) => {
		const searchInput = document.getElementById('search-input') as HTMLInputElement;
		if (!searchInput) return;

		const searchTerm = searchInput.value.trim().toLowerCase();
		if (searchTerm.length >= 3) {
			openSearchPanel();
			removeAllChild(searchPanel);
			UserTab.forEach(value => {
				if (value.username.toLocaleLowerCase().substring(0, searchTerm.length) === searchTerm) {
					const UserText: HTMLAnchorElement = createAnchorElement(`${value.slug}`, `${value.slug}`, `/user/${value.slug}`, 'text-emerald-600 hover:bg-orange-400 hover:font-bold text-xl w-full text-center transition-all duration-200 hover:scale-105 shadow-xl');
					searchPanel.appendChild(UserText);
					UserText.onclick = async() => {
						closeSearchPanel();
						await navigate(`/user/${value.slug}`);
					}
				}
			})
		}
		if (searchPanel.children.length === 0 && isOpen)
			closeSearchPanel();
		else if (searchTerm.length < 3)
			removeAllChild(searchPanel);
		else if (searchTerm.length < 3 && isOpen)
			closeSearchPanel();
	});
}

function closeSearchEvent(e: Event) {
	if (isSearchOpen && !searchWrapper.contains(e.target as Node)) {
		closeSearch();
	}
	if (isOpen)
		closeSearchPanel();
}

export function destroyCloseSearchEvent() {
	if (_eventListener && _eventListenerAttached) {
		document.removeEventListener('click', _eventListener);
		_eventListenerAttached = false;
		_eventListener = null;
	}
}

function eventCloseSearch() {
	_eventListener = closeSearchEvent;
	document.addEventListener('click', _eventListener);
	_eventListenerAttached = true;
}

function toggleSearch() {
	if (!isSearchOpen)
		openSearch();
	else
		closeSearch();
}

function openSearch() {
	fillUserTab();
	isSearchOpen = true;
	const sliding = (document.getElementById("sliding-search-bar-div") as HTMLElement);
	if (sliding)
		sliding.className = 'absolute right-0 top-0 w-72 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg border-2 border-emerald-600';
	
	const searchInput: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
	const closeButton: HTMLElement = document.getElementById('close-btn-div') as HTMLElement;
	setTimeout(() => {
		searchInput.className = 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-100 transition-opacity duration-300';
		closeButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-100 transition-opacity duration-300';
		searchInput.focus();
	}, 150);
}

async function fillUserTab() {
	try {
		const req = await getAllUsers();
		if (req.ok){
			UserTab = req.users;
		}
	} catch (error){
		await ErrorPopup(error as string);
	}
}

function closeSearch() {
	isSearchOpen = false;

	if (searchPanel)
		closeSearchPanel();
	
	const searchInput: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
	const closeButton: HTMLElement = document.getElementById('close-btn-div') as HTMLElement;
	if (searchInput)
		searchInput.className = 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-0 transition-opacity duration-300';
	if (closeButton)
		closeButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-0 transition-opacity duration-300';
		
	setTimeout(() => {
		const sliding = (document.getElementById("sliding-search-bar-div") as HTMLElement);
		if (sliding)
			sliding.className = 'absolute right-0 top-0 w-0 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg';
		if (searchInput)
			searchInput.value = '';
	}, 150);
}

function removeAllChild(parent: HTMLElement) {
	while (parent.firstChild)
		parent.removeChild(parent.firstChild);
}

function openSearchPanel() {
	isOpen = true;
	searchPanel.className = 'flex flex-col items-center space-y-4 absolute right-0 top-16 w-80 h-72 overflow-y-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-500 opacity-100';
}

function  closeSearchPanel() {
	if (searchPanel)
		removeAllChild(searchPanel);
	isOpen = false;
	searchPanel.className = 'flex flex-col items-center space-y-4 absolute right-0 top-16 w-0 h-0 overflow-y-auto transition-all duration-300 ease-in-out bg-orange-100 rounded-xl shadow-lg border-2 border-emerald-300 opacity-0';
}

