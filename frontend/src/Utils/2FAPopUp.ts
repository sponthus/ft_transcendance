import { activateTwoFa, checkTwoFaCode, deleteCookieTwofa, desactivateTwoFa} from '../api/user-service/2fa.js';
import {append, createElement, createImage, createButton, createDiv, createInput} from './elementMaker.js';
import { popUp } from './popUp.js';
import { ErrorPopup } from '../pages/ErrorPage.js';
import { navigate } from '../core/router.js';
import { getUserInfo } from '../api/user-service/user-info/getUserInfo.js';

let Inputs: HTMLInputElement[] = [];
let Success: boolean;

export async function activateTwoFaBtn() {
	try {
		const req = await activateTwoFa();
		if (req.ok)
			await addPopUpContent(req.qrCode!, false);
		else {
			const request = await getUserInfo();
			if (!request.ok)
				throw new Error(request.error);
			else {
				if (request.userInfo.twofa_enabled === 1)
					await desactivateTwoFaPopup();
				else
					throw new Error(req.error);
			}
				
		}
	} catch(error) {
		await ErrorPopup(error as string);
	}
}

export async function desactivateTwoFaPopup() {
	const DelPop: popUp = new popUp('2FA Authentification');
	DelPop.Title.className = "text-center text-emerald-600 font-bold"
	DelPop.Body.className = 'flex flex-col items-center justify-center bg-orange-200 rounded-xl shadow-xl p-6 w-80 space-y-4 -translate-y-96 transition-transform duration-300 ease-out';

	const containerBtn: HTMLElement = createDiv('container-btn', 'flex items-center justify-around w-full');

	const Btn: HTMLButtonElement = createButton('yes', 'bg-emerald-600 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'Yes');
	const backBtn: HTMLButtonElement = createButton('No', 'bg-red-500 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'No');

	append(containerBtn, [backBtn, Btn]);

	const Div: HTMLElement = createDiv('msg', 'border-2 p-4 border-emerald-600 flex items-center justify-center');
	append(Div, [createElement('p', 'msg', `Do you want to desactivate 2FA authentification ?`, 'text-emerald-600')]);

	DelPop.appendsToBody([Div, containerBtn]);
	DelPop.addOverlayToWindow();
	setTimeout(async() => {DelPop.Body.classList.remove('-translate-y-96');},100);

	Btn.addEventListener('click', async() => {
		try {
			const req = await desactivateTwoFa();
			if (!req.ok)
				throw new Error(req.error);
			else
				DelPop.removeOverlayToWindow();
		}
		catch (err) {
			await ErrorPopup(err as string);
		}
	})
	backBtn.addEventListener('click', () => {DelPop.removeOverlayToWindow();})
}

export async function loginTwoFa() {
    await addPopUpContent('', true);
}

async function addPopUpContent(url: string, active: boolean) {
    Inputs = [];
   
    Success = false;
	const QrPop: popUp = new popUp('2FA Authentification');
	QrPop.Title.className = "text-center text-emerald-600 font-bold"
	QrPop.Body.className = 'flex flex-col items-center justify-center bg-orange-200 rounded-xl shadow-xl p-6 w-80 space-y-4 -translate-y-96 transition-transform duration-300 ease-out';

	const containerBtn: HTMLElement = createDiv('container-btn', 'flex items-center justify-around w-full');

	const Btn: HTMLButtonElement = createButton('ok', 'bg-emerald-600 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'Ok');
	const backBtn: HTMLButtonElement = createButton('back', 'bg-red-500 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'Back');

	append(containerBtn, [backBtn, Btn]);
    if (!active)
	    QrPop.appendToBody(createImage('qr-code', 'object-center', url));
    QrPop.appendsToBody([addCodeInput(), containerBtn]);
	QrPop.addOverlayToWindow();
	setTimeout(async() => {QrPop.Body.classList.remove('-translate-y-96');},100);
	EventInputs();
	Btn.addEventListener('click', async() => {
        let str: string = "";
		Inputs.forEach(input => {str += input.value.toString();});
		try {
			const request = await checkTwoFaCode(str);
			if (request.ok) {
				QrPop.removeOverlayToWindow();
                Success = true;
				await navigate('/');
			}
            else
               throw new Error(request.error);
		} catch(error) {
			await ErrorPopup(error as string);
		}
	})
	backBtn.addEventListener('click', async() => {
		if (!active)
			deleteCookieTwofa();
		QrPop.removeOverlayToWindow();
	})
}

function EventInputs() {
	Inputs.forEach((input: HTMLInputElement, i: number) => {
		input.addEventListener('input', () => {
			if (input.value && i < Inputs.length - 1)
				Inputs[i + 1].focus();
		})
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Backspace' && !input.value && i > 0)
				Inputs[i - 1].focus();
		})
	})
}

function addCodeInput(): HTMLElement {
	const Div: HTMLElement = createDiv('otp-input', 'flex items-center justify-center w-full space-x-4');
	for (let i = 0; i < 6; i++) {
		const input: HTMLInputElement = createInput(['text', `input-${i}`, '_', true], `input-num-${i}`, 'w-[10%] text-2xl bg-orange-200 text-emerald-600');
		input.maxLength = 1;
		input.pattern = "[0-9]*";
		input.inputMode = 'numeric';
		append(Div, [input]);
		Inputs.push(input);
		if (i === 2)
			append(Div, [createElement('span', '', '', '')]);
	}
	return Div;
}
