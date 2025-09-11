import { createDiv, append, createInput, createButton } from "./elementMaker";
import { navigate } from "../core/router";

let isSearchOpen: boolean = false;
const searchWrapper: HTMLElement = createDiv("search-wrapper", 'relative flex items-center');

/*************************************functions for creating search button*************************************/
export function createSearchBarDiv(parent :HTMLElement) {

	append(searchWrapper, [createSearchToggle(), createSlidingSearchBar()]);

	parent.appendChild(searchWrapper);
	manageSearchBarEvent();
}

function createSlidingSearchBar() : HTMLElement {
	const slidingSearchBar = createDiv('sliding-search-bar', 'absolute right-0 top-0 w-0 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg')

	const searchInput: HTMLInputElement = createInput(['text', 'search', 'search...', true], 'search', 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-0 transition-opacity duration-300');

	const closeButton = createDiv('close-btn', 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-0 transition-opacity duration-300');
	closeButton.innerHTML = `
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	`;

	append(slidingSearchBar, [searchInput, closeButton])

	return slidingSearchBar;
}

function createSearchToggle(): HTMLButtonElement {

	const searchToggle: HTMLButtonElement = createButton('search-toggle', 'flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105', 'search');
	// searchToggle.title = 'search';
	// 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-100 transition-opacity duration-300'
	searchToggle.innerHTML = `
		<svg class="w-5 h-5 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		</svg>
	`;

	return searchToggle;
}

function manageSearchBarEvent() {
	(document.getElementById("search-toggle-btn") as HTMLButtonElement).addEventListener('click', toggleSearch);
	(document.getElementById('close-btn-div') as HTMLElement).addEventListener('click', closeSearch);
	handleSearchEnter();
	eventCloseSearch();
}

function handleSearchEnter() {
	(document.getElementById("search-input") as HTMLInputElement).addEventListener('keypress', (e) => {
		if (e.key === 'Enter')
			handleSearch();
	});
}

function eventCloseSearch() {
	document.addEventListener('click', (e) => {
		if (isSearchOpen && !searchWrapper.contains(e.target as Node)) {
			closeSearch();
		}
	});
}

function toggleSearch() {
	if (!isSearchOpen)
		openSearch();
	else
		closeSearch();
}

function openSearch() {
	isSearchOpen = true;
	(document.getElementById("sliding-search-bar-div") as HTMLElement).className = 'absolute right-0 top-0 w-72 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg border-2 border-emerald-600';
	
	const searchInput: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
	const closeButton: HTMLElement = document.getElementById('close-btn-div') as HTMLElement;
	setTimeout(() => {
		searchInput.className = 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-100 transition-opacity duration-300';
		closeButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-100 transition-opacity duration-300';
		searchInput.focus();
	}, 150);
}

function closeSearch() {
	isSearchOpen = false;

	const searchInput: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
	const closeButton: HTMLElement = document.getElementById('close-btn-div') as HTMLElement;

	searchInput.className = 'w-64 px-4 py-2 pl-4 pr-12 text-sm border-0 rounded-full bg-transparent focus:outline-none opacity-0 transition-opacity duration-300';
	closeButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 hover:text-gray-700 opacity-0 transition-opacity duration-300';
		
	setTimeout(() => {
		(document.getElementById("sliding-search-bar-div") as HTMLElement).className = 'absolute right-0 top-0 w-0 overflow-hidden transition-all duration-300 ease-in-out bg-orange-100 rounded-full shadow-lg';
		searchInput.value = '';
	}, 150);
}

function handleSearch() {
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	if (!searchInput) return;

	const searchTerm = searchInput.value.trim();
	if (searchTerm) {
		console.log('Recherche:', searchTerm);
		// Ici vous pouvez ajouter votre logique de recherche
		// Par exemple : navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
		
		// Exemple de navigation vers une page de recherche
		navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
	}
}