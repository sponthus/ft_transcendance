// This page is the basic logic : every page should inherit from her.
// Has render() and destroy()
import { renderBaseBanner, renderLoggedInBanner, renderLoggedOutBanner } from "./Banner";
import { checkLog } from "../api/user-service/connection/check-log";
import { getUserInfo } from "../api/user-service/user-info/getUserInfo";
import { SessionSocket } from "../core/SessionSocket.js";
import { setbackgroundImages } from "../Utils/elementMaker";

export abstract class BasePage {
    protected app: HTMLElement;
    protected banner: HTMLElement;

    // Protected = Cannot be instantiated directly
    protected constructor() {
        const appDiv = document.getElementById('app');
        if (!appDiv)
            throw new Error('App element not found');
		// appDiv.className = "transform scale-100"
        this.app = appDiv;
		// this.app.className = "min-h-[1080px] min-w-[1920px]";
        const bannerDiv = document.getElementById('banner');
		bannerDiv!.className = "z-50 relative";
        if (!bannerDiv)
            throw new Error('Banner element not found');
        this.banner = bannerDiv;
		// window.addEventListener('resize', () => {});
    }

    // Mandatory : Implement this in pages
    abstract render(): Promise<void>;

    protected async renderBanner(): Promise<void> {
		this.banner.innerHTML = '';
        renderBaseBanner(this.banner);

        const req = await checkLog();
        if (req.ok) {
			const req = await getUserInfo();
            if (!req.ok) {
				return; // Afficher une erreur ??
            }
            const userData = req.userInfo;
            const socket = SessionSocket.getInstance(); //Creation du socket du user
            await renderLoggedInBanner(this.banner, userData);
        }
        else {
            await renderLoggedOutBanner(this.banner);
            //await ErrorPopup(res.error); pas d'await ErrorPopupe peut etre la 
        }
    }

	protected initBackground(): HTMLElement {
		const BackgroundHome = document.createElement('div');
		BackgroundHome.className = "grid grid-col place-items-center h-screen min-h-[1080px] w-screen min-w-[1920px] p-8 overflow-hidden";
        setbackgroundImages(BackgroundHome, "url('/background1.gif')");
		return BackgroundHome;
	}
    // Optional : does nothing, can be overloaded if needed, to destroy listeners
    destroy(): void { 
		// this.banner.innerHTML = '';
		Array.from(this.banner.children).forEach(child => {
			Array.from(child.children).forEach(children => {
				child.removeChild(children);
			})
			this.banner.removeChild(child);
		})
		while (this.app.firstChild)
			this.app.removeChild(this.app.firstChild);
	}
}


// How to inherit from BasePage :
// export class GamePage extends BasePage {
//     private onKeydown: (e: KeyboardEvent) => void;
//     constructor() {
//          super(); // Calls the parent constructor
//         this.onKeydown = this.handleKeydown.bind(this);
//     }
//     render(): void {
//         this.app.innerHTML = `
//       <h1>Page de jeu</h1>
//       <p>Paragraph</p>
//     `;
//         window.addEventListener('keydown', this.onKeydown);
//     }
//     private handleKeydown(e: KeyboardEvent): void {
//         console.log('Pressed key :', e.key);
//     }
//     destroy(): void {
//         window.removeEventListener('keydown', this.onKeydown);
//         this.app.innerHTML = ''; // Clean visual
//     }
// }
