import { createElement, append } from "../../Utils/elementMaker";

export class endGamePage {

	private Page!: HTMLElement;

	constructor(Page: HTMLElement) {
		this.Page = Page;
	}

	async render() {
		append(this.Page, [(createElement("p", "score", "SCORE", "text-emerald-600 font-bold text-2xl") as HTMLElement)
							, (createElement('p', 'final-score', `7 - 0`, "text-emerald-600 font-bold text-2xl") as HTMLElement) // add real score
							, (createElement('p', 'Winner', "WINNER :", "text-emerald-600 font-bold text-2xl") as HTMLElement)
							, (createElement('p', 'final-Winner', `Crabby the bot`, "text-emerald-600 font-bold text-2xl") as HTMLElement)]) // add real winner
	}
}