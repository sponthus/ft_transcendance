import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import {Color} from "../Color.js";
import {windowMenu} from "./windowMenu.js";
import { getUserInfo, modifyUserAvatar, modifyUserInfo } from "../../api/user.js";

export class profileMenu {

	private _WindowPanel: windowMenu;
	private _bodyPanel: GUI.Rectangle;

	private _ProfilePic: GUI.Image // pic in API
	private _userName?: string // Name in API

	private _bestScore: number;
	private _lastscore: number;
	private _nbGame: number;

	private _slug: string;
	// private _friendList

	public constructor(scene: BABYLON.Scene, guiTexture: GUI.AdvancedDynamicTexture, colors : Color[], slug: string) {
		this._slug = slug;
		this._WindowPanel = new windowMenu(scene, guiTexture, colors, "Profile");
		this._bodyPanel = this._WindowPanel.getWindowBody();
		this._ProfilePic = new GUI.Image("profileImage", "../asset/pic/carlo.jpg"); // call API for url 
		this._bestScore = 0; // call API
		this._lastscore = 0; // call API
		this._nbGame = 0; // call API

		this._designMenu();
	}

	private async _getUsername(): Promise<void>{
		const req = await getUserInfo(this._slug);
		if (req.ok) {
            const userData = req.user;
            console.log("username = ", userData.username);
			console.log("slug in profile :",this._slug);
			this._userName = userData.username;
        }
		else {
			console.log("username undifined");
			this._userName = "foo";
			new Error('username undifined');
		}
	}

	private async _designMenu() {
		/*****************************init profile pic*****************************/
		const picRectange = new GUI.Rectangle as GUI.Rectangle;
		picRectange.width = "30%";
		picRectange.height = "30%";
		picRectange.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		picRectange.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		picRectange.cornerRadius = 12;
		picRectange.paddingLeft = "3%";
		picRectange.paddingTop = "3%";
		
		this._ProfilePic.width = "100%";
		this._ProfilePic.height = "100%";
		picRectange.addControl(this._ProfilePic);
		this._bodyPanel.addControl(picRectange);

		/*****************************init profile name*****************************/
		const userNamePanel = new GUI.Rectangle as GUI.Rectangle;
		userNamePanel.width = "40%";
		userNamePanel.height = "7%";
		userNamePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		userNamePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		userNamePanel.cornerRadius = 12;
		userNamePanel.thickness = 0;
		userNamePanel.paddingLeft = "10%";
		userNamePanel.paddingRight = "-10%";
		userNamePanel.paddingBottom = "-6%";
		userNamePanel.paddingTop = "6%";

		const UserNameText = new GUI.TextBlock as GUI.TextBlock;

		await this._getUsername();
		console.log("this username = ", this._userName);
		if (this._userName)
			UserNameText.text = this._userName;
		UserNameText.fontSize = "65%";
		UserNameText.width = "100%";
		UserNameText.height = "100%";
		UserNameText.fontFamily = "sans-serif";
		UserNameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		UserNameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

		userNamePanel.addControl(UserNameText);
		this._bodyPanel.addControl(userNamePanel);

		/*****************************init score game*****************************/ // last score and best score
				/*********best score*********/
		const bestscorePanel = new GUI.Rectangle as GUI.Rectangle;
		bestscorePanel.width = "50%";
		bestscorePanel.height = "6%";
		bestscorePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		bestscorePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		bestscorePanel.cornerRadius = 12;
		bestscorePanel.thickness = 0;
		bestscorePanel.paddingLeft = "10%";
		bestscorePanel.paddingRight = "-10%";
		bestscorePanel.paddingBottom = "-15%";
		bestscorePanel.paddingTop = "15%";

		const bestScoreText = new GUI.TextBlock as GUI.TextBlock;
		bestScoreText.text = `Best Score : ${this._bestScore}`;
		bestScoreText.fontSize = "50%";
		bestScoreText.width = "100%";
		bestScoreText.height = "100%";
		bestScoreText.fontFamily = "sans-serif";
		bestScoreText.paddingLeft = "-30%";
		bestScoreText.paddingRight = "30%";

		bestscorePanel.addControl(bestScoreText);

				/*********last score*********/
		const lastScorePanel = new GUI.Rectangle as GUI.Rectangle;
		lastScorePanel.width = "50%";
		lastScorePanel.height = "6%";
		lastScorePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		lastScorePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		lastScorePanel.cornerRadius = 12;
		lastScorePanel.thickness = 0;
		lastScorePanel.paddingLeft = "10%";
		lastScorePanel.paddingRight = "-10%";
		lastScorePanel.paddingBottom = "-23%";
		lastScorePanel.paddingTop = "23%";

		const lastScoreText = new GUI.TextBlock as GUI.TextBlock;
		lastScoreText.text = `Last Score : ${this._lastscore}`;
		lastScoreText.fontSize = "50%";
		lastScoreText.width = "100%";
		lastScoreText.height = "100%";
		lastScoreText.fontFamily = "sans-serif";
		lastScoreText.paddingLeft = "-30%";
		lastScoreText.paddingRight = "30%";

		lastScorePanel.addControl(lastScoreText);

		this._bodyPanel.addControl(bestscorePanel);
		this._bodyPanel.addControl(lastScorePanel);

		/*****************************number of game*****************************/
		const nbOfGamePanel = new GUI.Rectangle as GUI.Rectangle;
		nbOfGamePanel.width = "50%";
		nbOfGamePanel.height = "6%";
		nbOfGamePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		nbOfGamePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		nbOfGamePanel.cornerRadius = 12;
		nbOfGamePanel.thickness = 0;
		nbOfGamePanel.paddingLeft = "10%";
		nbOfGamePanel.paddingRight = "-10%";
		nbOfGamePanel.paddingBottom = "10%";
		nbOfGamePanel.paddingTop = "-10%";

		const nbOfGameText = new GUI.TextBlock as GUI.TextBlock;
		nbOfGameText.text = `Games : ${this._nbGame}`;
		nbOfGameText.fontSize = "50%";
		nbOfGameText.width = "100%";
		nbOfGameText.height = "100%";
		nbOfGameText.fontFamily = "sans-serif";
		nbOfGameText.paddingLeft = "-30%";
		nbOfGameText.paddingRight = "30%";

		nbOfGamePanel.addControl(nbOfGameText);

		this._bodyPanel.addControl(nbOfGamePanel);

		/*****************************friend list*****************************/
		const friendListPanel = new GUI.Rectangle as GUI.Rectangle;
		friendListPanel.width = "40%";
		friendListPanel.height = "55%";
		friendListPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		friendListPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		friendListPanel.cornerRadius = 12;
		// friendListPanel.thickness = 0;
		friendListPanel.paddingLeft = "-5%";
		friendListPanel.paddingRight = "5%";
		friendListPanel.paddingBottom = "-20%";
		friendListPanel.paddingTop = "20%";

		const scrollViewer = new GUI.ScrollViewer as GUI.ScrollViewer;
		scrollViewer.width = "100%";
		scrollViewer.height = "100%";
		scrollViewer.barColor = "grey";
		scrollViewer.thickness = 0;

		const contentPanel = new GUI.StackPanel();
		contentPanel.width = "100%";
		for (let i:number = 0; i < 30; i++) {
			const rec = new GUI.Rectangle(`friendRect${i}`);
			rec.width = "100%";
			rec.height = "40px";
			rec.thickness = 1;
			rec.background = "red";

			const text = new GUI.TextBlock(`friendText${i}`, `Friend ${i}`);
			text.color = "black";
			text.fontSize = "14px";
			text.height = "100%";
			text.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
			text.paddingLeft = "-20%";
			text.paddingRight = "20%";

			rec.addControl(text);
			contentPanel.addControl(rec);
		}
		scrollViewer.addControl(contentPanel);
		friendListPanel.addControl(scrollViewer);
		this._bodyPanel.addControl(friendListPanel);
	}
	public getWindow(): windowMenu {
		return this._WindowPanel;
	}
}