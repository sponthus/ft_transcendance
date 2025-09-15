import sketch from "../sketch";
import p5 from "p5";
import { BasePage } from "./BasePage";

export class NotFoundPage extends BasePage {

	constructor() {
		super();
	}
	
	// private setUpGame() {

	// }
	async render(): Promise<void> {
		new p5(sketch);
	}
}

