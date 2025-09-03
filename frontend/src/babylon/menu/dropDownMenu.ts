/*****************************************************************export class for dropdown menu*****************************************************************/

import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { Color } from "../Color";
import {settingMenu} from "./settingMenu";
import {profileMenu} from "./ProfileMenu";
import {messageMenu} from "./messageMenu";
import {historyMenu} from "./historyMenu";
import { navigate } from '../../core/router.js';

export class DropDownMenu {

	private _scene: BABYLON.Scene;
	/************************for dropdown menu****************************/
	private	_guiTexture: GUI.AdvancedDynamicTexture;
	private	_mainButton: GUI.Button;
	private _optionPanel:GUI.StackPanel;
	private	_optionButton: string[] | null = null;
	private _container: GUI.Grid;
	private _hamburButton: GUI.Button;

	/************************for menus****************************/
	private _settingMenu: settingMenu;
	private _profileMenu: profileMenu;
	private _messageMenu: messageMenu;
	private _historyMenu: historyMenu;

	private _colorBackground: Color;
	private _colorText: Color;

	private _slug: string;

	public constructor(scene: BABYLON.Scene, slug: string) {
		this._slug = slug;
		console.log("slug in dropdown menu :", this._slug);
		this._scene = scene;
		this._colorBackground = new Color(100 ,25, 74, 255); // call API
		this._colorText = new Color(0 ,0, 0, 255); // call API
		/************************create gui texture****************************/
		this._guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		
		/************************create grid container****************************/
		this._container = new GUI.Grid;
		this._initContainer();

		/************************create main button****************************/
		this._mainButton = GUI.Button.CreateSimpleButton("mainButton", "Menu");
		this._initMainButton();

		/************************create button hamburger****************************/		
		this._hamburButton = GUI.Button.CreateSimpleButton("circleButton","");
		this._initHamburgerbutton();

		/************************create option menu****************************/
		this._optionPanel = new GUI.StackPanel();
		this._optionPanel.isVisible = false;
		this._container.addControl(this._optionPanel,1,1); // add option menu in container grid
		
		/************************create option button****************************/
		this._initDropdownButtons();

		/************************create menus panel****************************/
		this._settingMenu = new settingMenu(this._scene, this._guiTexture ,[this._colorBackground, this._colorText]);
		this._profileMenu = new profileMenu(this._scene, this._guiTexture, [this._colorBackground, this._colorText], this._slug);
		this._messageMenu = new messageMenu(this._scene, this._guiTexture, [this._colorBackground, this._colorText]);
		this._historyMenu = new historyMenu(this._scene, this._guiTexture, [this._colorBackground, this._colorText]);
	}

	private _initContainer() {
		this._container.addColumnDefinition(40, true);
		this._container.addColumnDefinition(220, true);
		this._container.addRowDefinition(40, true);
		this._container.addRowDefinition(240, true);
		
		this._container.width = "260px";
		this._container.height = "260px";
		this._container.top = "40px";
		this._container.left = "-10px"; 
		this._container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		this._container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		this._container.leftInPixels = 200;
		this._guiTexture.addControl(this._container);
	}

	private _initMainButton() {
		this._mainButton.width = "220px";
		this._mainButton.height = "40px";
		this._mainButton.background = this._colorBackground._color4ToCss();
		this._mainButton.color = this._colorText._color4ToCss();
		this._mainButton.thickness = 0;
		this._mainButton.fontFamily = "sans-serif";
		this._mainButton.fontSize = "20px";
		this._mainButton.isVisible = false;
		this._container.addControl(this._mainButton,0,1); // add button in container grid
	}

	private _initDropdownButtons() {
		this._optionButton = ["Profile", "Message", "Setting", "History", "Logout"];
		let i: number = 0;
		this._optionButton.forEach( option => {
			const button = GUI.Button.CreateSimpleButton(`option${option}`, option);
			button.width = "220px";
			button.height = "40px";
			button.fontFamily = "sans-serif";
			button.thickness = 0;
			button.fontSize = "20px";
			button.background = this._colorBackground._color4ToCss();
			button.color = this._colorText._color4ToCss();
			console.log("option : ",option);
			button.onPointerUpObservable.add(async () => {
				this._scene.onKeyboardObservable.add((kb) => {
					const key = kb.event.key.toLowerCase();
					if ((key == "escape" || key == "tab"))
						this._setVisibleoptionstofalse();
				})
				this._setVisibleoptionstofalse();
				if (option == "Setting")
					this._settingMenu.getWindow()._setVisible(!this._settingMenu.getWindow()._isVisible());
				if (option == "Profile")
					this._profileMenu.getWindow()._setVisible(!this._profileMenu.getWindow()._isVisible());
				if (option == "Message")
					this._messageMenu.getWindow()._setVisible(!this._messageMenu.getWindow()._isVisible());
				if (option == "History")
					this._historyMenu.getWindow()._setVisible(!this._historyMenu.getWindow()._isVisible());
				if (option == "Logout")
				{	
					/*************don't work as expect*******/
					// TODO = Logout correctly
					await navigate('/');
				}
				this._optionPanel.isVisible = false;
			})
			console.log("add button : ", option);
			this._optionPanel.addControl(button); // add every option button on option panel
		});

		this._mainButton.onPointerUpObservable.add(() =>{
			const shouldShow = !this._optionPanel.isVisible;
			this._optionPanel.isVisible = true;
			this._animateoptionPanel(shouldShow);
		})
	}

	private _initHamburgerbutton() {
		this._hamburButton.width = "40px";
		this._hamburButton.height = "40px";
		this._hamburButton.color = this._colorText._color4ToCss();
		this._hamburButton.background = this._colorBackground._color4ToCss();
		this._hamburButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		this._hamburButton.thickness = 0;
		this._container.addControl(this._hamburButton,0,0);

		this._designHamburger(this._hamburButton, "25px", "5px")

		this._hamburButton.onPointerUpObservable.add(() =>{
			if (this._optionPanel.isVisible)
				this._animateoptionPanel(false);
			const shouldShow = !this._mainButton.isVisible;
			this._gridAnimation(shouldShow);
			this._mainButton.isVisible = !this._mainButton.isVisible;
		})
	}

	private _designHamburger(button: GUI.Button, width: string, height: string) {
		for (let i:number = 0; i < 3; i++) {
			const bar = new GUI.Rectangle();
			bar.width = width;
			bar.height = height;
			bar.color = this._colorText._color4ToCss();
			bar.background = this._colorText._color4ToCss();
			bar.top = `${10 + i * 8}px`;
			bar.cornerRadius = 12;
			bar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
			bar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
			button.addControl(bar);
		}
	}

	private _setVisibleoptionstofalse() {
		if (this._settingMenu.getWindow()._isVisible() == true)
			this._settingMenu.getWindow()._setVisible(false);
		if (this._profileMenu.getWindow()._isVisible() == true)
			this._profileMenu.getWindow()._setVisible(false);
		if (this._messageMenu.getWindow()._isVisible() == true)
			this._messageMenu.getWindow()._setVisible(false);
		if (this._historyMenu.getWindow()._isVisible() == true)
			this._historyMenu.getWindow()._setVisible(false);
	}

	private	_animateoptionPanel(visible: boolean) {
		let fromHeight: number = visible ? 0: this._optionPanel.heightInPixels;
		let toHeight: number = visible ? 240: 0;
		let fromTop: number = visible ? -240: 0;
		let toTop: number = visible ? 0: -240;
		const	toptAnimation = new BABYLON.Animation(
			"PanelHeight",
			"topInPixels",
			60,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		) as BABYLON.Animation;
		toptAnimation.setKeys([
			{frame: 0, value: fromTop},
			{frame:10, value: toTop}]);
		const heightAnimation = new BABYLON.Animation(
			"PanelHeight",
			"heightInPixels",
			60,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		) as BABYLON.Animation;
		heightAnimation.setKeys([
			{frame: 0, value: fromHeight},
			{frame:10, value: toHeight}]);

		this._optionPanel.animations = [];
		this._optionPanel.animations.push(toptAnimation);
		this._optionPanel.animations.push(heightAnimation);

		if (visible) 
			this._optionPanel.isVisible = true;
		this._scene.beginAnimation(this._optionPanel, 0, 10, false).onAnimationEndObservable.add(() => {
			this._optionPanel.isVisible = visible;
			if (!visible)
					this._optionPanel.topInPixels = 0;
		});
	}

	private _gridAnimation(visible: boolean) {
		const fromLeft: number = this._container.leftInPixels;
		const toLeft: number = visible ? -10: 200;

		const LeftAnimation = new BABYLON.Animation(
			"gridLeft",
			"leftInPixels",
			60,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
		)
		LeftAnimation.setKeys([
			{frame: 0, value: fromLeft},
			{frame: 10, value: toLeft}
		])

		this._container.animations = [LeftAnimation];
		this._scene.beginAnimation(this._container, 0 , 10, false);
	}
}
