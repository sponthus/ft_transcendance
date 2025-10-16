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
