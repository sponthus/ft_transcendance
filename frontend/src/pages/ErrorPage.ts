import { error } from "console";
import { popUp } from "../Utils/popUp";
import { append, createButton, createDiv, createElement } from "../Utils/elementMaker";
import { resolve } from "path";


export function ErrorPopup(Error: string): Promise<void> {
	let ErrPopup: popUp;
	return new Promise((resolve) => {
		ErrPopup = new popUp("Error");
		ErrPopup.Body.className = 'flex flex-col items-center justify-center bg-white rounded-xl shadow-xl p-6 w-80 h-[25%] w-[25%] gap-4 -translate-y-96 transition-transform duration-300 ease-out';
		ErrPopup.Title.className = 'text-lg font-bold mb-4 text-red-500 text-center';
	
		const Div: HTMLElement = createDiv('error', 'border-2 p-4 border-red-500 flex items-center justify-center');
		append(Div, [createElement('p', 'error', Error, 'text-red-500')]);
	
		const Btn: HTMLButtonElement = createButton(`ok-${Error}`, 'bg-red-500 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'ok');
	
		ErrPopup.appendsToBody([Div, Btn]);
		ErrPopup.addOverlayToWindow();
		setTimeout(async() => {ErrPopup.Body.classList.remove('-translate-y-96');},100);
	
		Btn.addEventListener('click', () => {
			ErrPopup.removeOverlayToWindow();
			resolve();});
	});
}
