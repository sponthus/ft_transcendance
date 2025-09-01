export class popUp{
	protected _Overlay!: HTMLElement;
	protected _Body!: HTMLElement;
	protected _Title!: HTMLElement;

	constructor(Title: string) {
		this.initPopUp(Title);
	}

	private initPopUp(Title: string) {
		this.initOverlay();
		this.initBody();
		this.initTitle(Title);
	}

	private initOverlay() {
		this._Overlay = document.createElement('div');
		this._Overlay.id = "PopUp";
		this._Overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen min-h-[540px] w-screen min-w-[960px] ';
	}

	private initBody() {
		this._Body = document.createElement('div');
		this._Body.className = 'bg-white rounded-xl shadow-xl p-6 w-80';
		this._Overlay.appendChild(this._Body);
	}

	private initTitle(Title: string) {
		this._Title = document.createElement('h2');
		this._Title.className = 'text-lg font-bold mb-4';
		this._Title.textContent =  Title;
		this._Body.appendChild(this._Title);
	}

	cleanBody() {
		Array.from(this._Body.children).forEach((child, index)=>{
			if (index == 0)
				return ;
			child.remove();
		})
	}

	changeBodyClass(ClassName: string) {
		this._Body.className = ClassName;
	}

	appendToBody(content: any) {
		this._Body.appendChild(content);
	}

	appendsToBody(contents: any[]) {
		contents.forEach(content => {
			this._Body.appendChild(content);
		})
	}

	addOverlayToWindow() {
		document.body.appendChild(this._Overlay);
	}

	removeOverlayToWindow() {
		document.body.removeChild(this._Overlay);
	}

	changeTitleText(Title: string) {
		this._Title.textContent = Title;
	}

	changeTitleClass(ClassName: string) {
		this._Title.className = ClassName;
	}

	get OverlayDiv() :HTMLElement {
		return this.OverlayDiv;
	}
}