import { activateTwoFa, checkTwoFaCode } from '../api/user-service/2fa.js';
import {append, createElement, createImage, createButton, createDiv, createInput} from './elementMaker.js';
import { popUp } from './popUp.js';
import { ErrorPopup } from '../pages/ErrorPage.js';
import { navigate } from '../core/router.js';

let Inputs: HTMLInputElement[] = [];
let Success: boolean;

export async function activateTwoFaBtn() {
	const req = await activateTwoFa();
	if (req.ok) {
        await addPopUpContent(req.qrCode!, false);
	}
}

export async function loginTwoFa() {
    await addPopUpContent('', true);
}

async function addPopUpContent(url: string, active: boolean) {
    Inputs = [];
   
    Success = false;
	const QrPop: popUp = new popUp('Double Authentification');
	QrPop.Body.className = 'flex flex-col items-center justify-center bg-white rounded-xl shadow-xl p-6 w-80 space-y-4';

	const Btn: HTMLButtonElement = createButton('ok', 'bg-red-500 p-2 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300', 'ok');

    if (!active)
	    QrPop.appendToBody(createImage('qr-code', 'object-center', url));
    QrPop.appendsToBody([addCodeInput(), Btn]);
    Inputs.forEach(input => {console.log(input.value)});
	QrPop.addOverlayToWindow();
	EventInputs();
	Btn.addEventListener('click', async() => {
        let str: string = "";
		Inputs.forEach(input => {str += input.value.toString();});
		try {
            console.log('str = ', str);
			const request = await checkTwoFaCode(str);
			if (request.ok) {
				console.log('successfully add 2FA: ');
				QrPop.removeOverlayToWindow();
                Success = true;
				await navigate('/');
			}
            else
                console.log(request.error);
		} catch(error) {
			await ErrorPopup(error as string);
		}
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
		const input: HTMLInputElement = createInput(['text', `input-${i}`, '_', true], `input-num-${i}`, 'w-[10%] text-2xl');
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
