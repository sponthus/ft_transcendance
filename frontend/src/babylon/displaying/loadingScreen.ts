/*****************************************************************export class for render scene*****************************************************************/

import { createDiv } from "../../Utils/elementMaker";

export class LoadingScreen {

	loadingUIBackgroundColor:string;
	loadingUIText;		
	private _canvas: HTMLCanvasElement;
	private _loadingDiv?: HTMLElement;

	constructor(canvas: HTMLCanvasElement) {
		this.loadingUIBackgroundColor = "black";
		this.loadingUIText = "loading ..."
		this._loadingDiv =  createDiv('', 'h-full w-full fixed inset-0');
		this._loadingDiv.classList.add('hidden');
		this._loadingDiv!.innerHTML = `<div class="flex min-h-screen items-center justify-center bg-gradient-to-tr to-orange-300 from-orange-100 p-10">
 											<div class="w-max">
												<img class="mx-auto object-cover rounded-full object-center h-32 w-18 transition-all duration-200 transform animate-wiggle" src="/logo/logoIlsandWorld.png">
												</img>
												<h1 class="animate-typing h-full w-full overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-5xl text-emerald-600 font-bold">
												loading ...
												</h1>

 											</div>
										</div>`;
		this._canvas = canvas;
		(document.getElementById('app') as HTMLElement).appendChild(this._loadingDiv);
	}
												// <svg class="w-full aspect-square animate-spin bg-transparent" viewBox="0 0 24 24"> 
												// 	<circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-opacity="0.25"/>
  												// 	<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
												// </svg>
	displayLoadingUI() {
		this._loadingDiv!.classList.remove('hidden');
	}

	hideLoadingUI() {
		this._loadingDiv!.classList.add('hidden');
	}

	dispose() {
		if (this._loadingDiv) {
		    (document.getElementById('app') as HTMLElement).removeChild(this._loadingDiv);
		}
	}
}
