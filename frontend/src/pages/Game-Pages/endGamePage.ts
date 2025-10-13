import { createDetailMapPlugin } from "@babylonjs/core";
import { createElement, append, createImage, createButton, createDiv, setbackgroundImages } from "../../Utils/elementMaker";
import { getAllTournaments, TournamentsInfos } from "../../api/game-service/tournaments/getTournaments";
import { UserInfo } from "../../api/user-service/user-info/getUserInfo";
import { AllGamesInfos, AllGamesResult, getAllGames } from "../../api/game-service/games/game";
import { ErrorPopup } from '../ErrorPage.js';

type UserData = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
	id: number
	username: string;
	nickname: string;
	avatar: string;
	slug: string;
	created_at: string;
};

export class endGamePage {

	private Page!: HTMLElement;

	private PlayBtn!: HTMLButtonElement;
	private BackBtn!: HTMLButtonElement;

	private endGamePan!: HTMLElement;

	private UserData!: UserInfo;
	constructor(Page: HTMLElement) {
		this.Page = Page;
	}

	async render(tournament: boolean, id: number, UserData: UserInfo) {
		this.UserData = UserData;
		const btnDiv = createDiv('btn', 'flex flex-row justify-around w-full h-[20%] -translate-x-96');
		this.InitEndGameForm(btnDiv);
		await this.fillEndGamePan(tournament, id);
		this.appendEndGameForm(btnDiv);
	}

	/****************fill panel EndGame****************/
	private async fillEndGamePan(tournament: boolean, id: number) {
		if (tournament) 
			await this.fillEndTournament(id);
		else 
			await this.fillEndgame(id);

	}

	private async fillEndTournament(id: number) {
		try {
			const req = await getAllTournaments(this.UserData.slug);
			if (req.ok) {
				req.tournaments.forEach(tournament => {
					if (tournament.id == id) 
						this.AddTournamentEndGame(tournament);
				})
			}
		} catch(error) {
			await ErrorPopup(error as string);
		}
	}

	private async fillEndgame(id: number) {
		try {
			const req = await getAllGames(this.UserData.slug);
			if (req.ok) {
				req.games.forEach(game => {
					if (game.id == id)
						this.addGameEndGame(game);
				})
			}
		} catch(error) {
			await ErrorPopup(error as string);
		}
	}

	private async addGameEndGame(game: AllGamesInfos) {
		append(this.endGamePan, [this.createWinnerPan(game), this.createScorePan(game)]);
	}

	private async AddTournamentEndGame(tournament: TournamentsInfos) {
		append(this.endGamePan, [this.createWinnerPan(tournament)]);
	}
	
	private createWinnerPan(Party: any): HTMLElement {
		const WinnerDiv = createDiv('winner', 'flex flex-col items-center justify-center translate-y-24 gap-4');
		const winnerPan: HTMLElement = createDiv('winner-pan', 'flex items-center justify-center w-full h-[50%] animate-bounce');
		setbackgroundImages(winnerPan, "url('/game_ui/setting/emptyPan.png')");
		winnerPan.appendChild(createElement('p', 'winner', `${Party.winner}`, "text-orange-200 text-2xl"))

		append(WinnerDiv, [createElement('p', 'Winner', 'Winner', 'text-6xl text-orange-200')
						, winnerPan])

		return WinnerDiv;
	}

	private createScorePan(Party: any) {
		const Scorediv = createDiv('Score', 'flex flex-col items-center justify-center translate-y-24 gap-4');
		const ScorePan: HTMLElement = createDiv('Score-pan', 'flex items-center justify-center w-full h-[50%]');
		setbackgroundImages(ScorePan, "url('/game_ui/setting/emptyPan.png')");
		ScorePan.appendChild(createElement('p', 'Score', `${Party.score_a} - ${Party.score_b}`, "text-orange-200 text-2xl"))

		append(Scorediv, [createElement('p', 'Score', 'Score', 'text-6xl text-orange-200')
						, ScorePan])

		return Scorediv;
	}

	/****************creating backbtn and playbtn and EndGame panel****************/
	private InitEndGameForm(btnDiv: HTMLElement) {
		this.BackBtn = (createButton("return", "relative flex items-center active:scale-95 hover:scale-105 h-full w-[20%] transition-all duration-200", "") as HTMLButtonElement);
		this.PlayBtn = (createButton("play", "relative flex items-center active:scale-95 hover:scale-105 h-full aspect-square transition-all duration-200", "") as HTMLButtonElement);
		append(this.PlayBtn, [createImage('Play', 'absolute object-center h-full w-full', 'game_ui/Playebtn.png')]);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		append(btnDiv, [this.BackBtn, this.PlayBtn]);

		this.endGamePan = createDiv('EndGame-pan', 'relative flex flex-col items-center w-full h-[85%] transition-all duration-200 translate-x-96 space-y-4');
		setbackgroundImages(this.endGamePan, "url('game_ui/setting/SettingPan.png')");
	}

	/****************append element for  EndGame panel****************/
	private appendEndGameForm(btnDiv: HTMLElement) {
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-20", 'EndGame-page.png')]);

		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/LocalPongText.png') /**change to EndGame title */
						, this.endGamePan, btnDiv]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 rounded-xl space-y-4";
		setTimeout(async() => {
			this.endGamePan.classList.remove('translate-x-96');
			btnDiv.classList.remove('-translate-x-96');
		}, 300);
	}

	get _playBtn() : HTMLButtonElement {
		return this.PlayBtn;
	}

	get _backBtn(): HTMLButtonElement {
		return this.BackBtn;
	}
}