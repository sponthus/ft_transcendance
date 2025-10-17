// This page is the basic logic : every page should inherit from her.
// Has render() and destroy()
import { cleanBanner, renderBaseBanner, renderLoggedInBanner, renderLoggedOutBanner, updateResize } from "./Banner";
import { checkLog } from "../api/user-service/connection/check-log";
import { getUserInfo } from "../api/user-service/user-info/getUserInfo";
import { SessionSocket } from "../core/SessionSocket.js";
import { setbackgroundImages } from "../Utils/elementMaker";
import { resolve } from "path";
import { ErrorPopup } from "./ErrorPage";

export abstract class BasePage {
    protected app: HTMLElement;
    protected banner: HTMLElement;

    protected constructor() {
        const appDiv = document.getElementById('app');
        if (!appDiv)
            throw new Error('App element not found');
        this.app = appDiv;
        const bannerDiv = document.getElementById('banner');
		bannerDiv!.className = "z-50 relative";
        if (!bannerDiv)
            throw new Error('Banner element not found');
        this.banner = bannerDiv;
    }

    abstract render(): Promise<void>;

    protected async renderBanner(): Promise<void> {
        this.banner.innerHTML = '';
        renderBaseBanner(this.banner);
        try{
            const req = await checkLog();
            if (req.ok) {
                const req = await getUserInfo();
                if (!req.ok)
                    throw new Error(req.error);
                const userData = req.userInfo;
                const socket = SessionSocket.getInstance(); //Creation du socket du user
                await renderLoggedInBanner(this.banner, userData);
            }
            else 
                await renderLoggedOutBanner(this.banner);
        } catch(error) {
            await ErrorPopup(error as string);
        }

    }

    protected destroyBanner(): Promise<void> {
        return new Promise((resolve) => {
		    Array.from(this.banner.children).forEach(child => {
		    	Array.from(child.children).forEach(children => {children.remove();})
		    	child.remove();
		    })
            this.banner.innerHTML = '';
            resolve();     
        })
    }

	protected initBackground(): HTMLElement {
		const BackgroundHome = document.createElement('div');
		BackgroundHome.className = "grid grid-col place-items-center h-screen min-h-[1080px] w-screen min-w-[1920px] p-8 overflow-hidden";
        setbackgroundImages(BackgroundHome, "url('/background1.gif')");
		return BackgroundHome;
	}

    destroy(): void {
		this.banner.innerHTML = '';
        this.app.innerHTML = '';
        cleanBanner();
	}

    public async updateBanner(){
		updateResize();
    }
}


