import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { getAllGames } from '../../api/game.js';
import { State } from '../../core/state.js';
import { UserPage } from './UserPage.js';

const state = State.getInstance();

export async function DisplayHistoryPage(Body: HTMLElement) {
	// Body.textContent = "i'm in the History body";
	if(!state.isLoggedIn)
		Body.textContent = "not connected user";

	Body.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-auto";
	try {
		const res = await getAllGames(state.user!.id);
		if (!res.ok) {
			Body.textContent = "Error loading games... please retry ";
			return ;
		}
		const games = res.games;
		if (games.length === 0) {
			Body.textContent = "there is no games";
		}
		else {
			games.map((party: any, i: number) => {
				const PartyDiv = createDiv("party-div", "flex items-center min-h-[150px] w-[100%] border-2 border-orange-300 hover:border-orange-400 space-x-8");

				createGameId(PartyDiv, i);
				createPlayers(PartyDiv, i);
				createBeginAt(PartyDiv, i);
				createFinishAt(PartyDiv, i);
				createCreatedAt(PartyDiv, i);
				createCreatedBy(PartyDiv, i);
				createScore(PartyDiv, i);;
				createWinner(PartyDiv, i);
					
				append(Body, [PartyDiv]);
			})
		}

	}
	catch (error) {
		alert("error: " + error);
	}
}

function createHistoryDiv(id: string) : HTMLElement {
	const Div = createDiv(id, "h-full w-[11%] border-2 grid grid-rows-4 items-center justify-center space-y-10");
	return Div;
}

function createGameId(PartyDiv: HTMLElement, i: number) {
	const GameIdDivs = createHistoryDiv("Games-id" + i.toString()) as HTMLElement;
	const GameIdText = createElement('h2', "Games-id" + i.toString(), `Party #${i.toString()} :` , "text-emerald-600 text-center font-boldunderline ");
	append(GameIdDivs, [GameIdText]);

	append(PartyDiv, [GameIdDivs]);
}

function createPlayers(PartyDiv: HTMLElement, i: number) {
		const PlayersDivs = createHistoryDiv("players" + i.toString()) as 		HTMLElement;
		const PlayersText = createElement('h2', "players" + i.toString(), `Players :` , "text-emerald-600 text-center font-bold underline ");
		append(PlayersDivs, [PlayersText]);

		append(PartyDiv, [PlayersDivs]);
}

function createBeginAt(PartyDiv: HTMLElement, i: number) {
	const BeginAtDiv = createHistoryDiv("begin-at" + i.toString()) as HTMLElement;
	const BeginAtText = createElement('h2', "party-statue" + i.toString(), `Begin At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(BeginAtDiv, [BeginAtText]);

	append(PartyDiv, [BeginAtDiv]);
}

function createFinishAt(PartyDiv: HTMLElement, i: number) {
	const FinishAtDiv = createHistoryDiv("finish-at" + i.toString()) as HTMLElement;
	const FinishAtText = createElement('h2', "party-statue" + i.toString(), `Finish At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(FinishAtDiv, [FinishAtText]);

	append(PartyDiv, [FinishAtDiv]);
}

function createCreatedAt(PartyDiv: HTMLElement, i: number) {
	const CreatedAtDivs = createHistoryDiv("created-at" + i.toString()) as HTMLElement;
	const CreatedAtText = createElement('h2', "party-statue" + i.toString(), `Created At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(CreatedAtDivs, [CreatedAtText]);

	append(PartyDiv, [CreatedAtDivs]);
}

function createCreatedBy(PartyDiv: HTMLElement, i: number) {
	const CreatedBytDivs = createHistoryDiv("created-by" + i.toString()) as HTMLElement;
	const CreatedBytText = createElement('h2', "party-statue" + i.toString(), `Created By : `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(CreatedBytDivs, [CreatedBytText]);

	append(PartyDiv, [CreatedBytDivs]);
}

function createScore(PartyDiv: HTMLElement, i: number) {
	const ScoreDiv = createHistoryDiv("score" + i.toString()) as HTMLElement;
	const ScoreText = createElement('h2', "party-statue" + i.toString(), `Score: `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(ScoreDiv, [ScoreText]);

	append(PartyDiv, [ScoreDiv]);
}

function createWinner(PartyDiv: HTMLElement, i: number) {
	const WinnerDiv = createHistoryDiv("winner" + i.toString()) as HTMLElement;
	const WinnerText = createElement('h2', "party-statue" + i.toString(), `Winner: `, "text-emerald-600 text-center underline font-bold") as HTMLElement;
	append(WinnerDiv, [WinnerText]);

	append(PartyDiv, [WinnerDiv]);
}