import { createDiv, createElement, append, setbackgroundImages} from '../../Utils/elementMaker.js';
import {getFinishedGames } from '../../api/game-service/games/game.js';
import { UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { ErrorPopup } from '../ErrorPage.js';


export async function DisplayHistoryPage(Body: HTMLElement, UserData: UserInfo) {
	// Body.textContent = "i'm in the History body";
	Body.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-auto gap-4";
	try {
		const res = await getFinishedGames(UserData.slug!); // replace by id
		// const res = await  (UserData.id);
		if (!res.ok) {
			Body.textContent = "Error loading games... please retry ";
			return ;
		}
		const games = res.games;
		if (games.length === 0) {
			Body.textContent = "there is no games";
		}
		else {
			fillHistoryStubborn(Body);
			games.map((party: any, i: number) => {
				if(party.tournament_id == 0)
					FillHistory(Body, party, i, UserData);});
		}
	}
	catch (error) {
		ErrorPopup("error: " + error);
	}
}

export async function FillHistory(Body: HTMLElement, party: any, index:number, UserData: UserInfo) {
	console.log("party = ", party);
	const PartyDiv = createDiv("party-div", "flex items-center h-[30%] w-[100%] hover:bg-orange-400 hover:bg-opacity-50 space-x-8");

	createGameId(PartyDiv, index, party);
	createPlayers(PartyDiv, index, party);
	createBeginAt(PartyDiv, index, party);
	createFinishAt(PartyDiv, index, party);
	createCreatedAt(PartyDiv, index, party);
	createCreatedBy(PartyDiv, index, UserData.username);
	createScore(PartyDiv, index, party);;
	createWinner(PartyDiv, index, party);
		
	append(Body, [PartyDiv]);
}

export function fillHistoryStubborn(body: HTMLElement) {
	const StubborndDiv = createDiv("Stubborn-div", "flex items-center h-[10%] w-[100%] space-x-8");
	append(StubborndDiv, [createStubborngameId(), createStubbornPlayer(), createStubbornBeginAt(), createStubbornFinishedAt(), createStubbornCreatedAt(),createStubbornCreatedBy(), createStubbornScore(), createStubbornWinner()]);
	append(body, [StubborndDiv]);

}

function crateStubbornDiv(textContent: string): HTMLElement {
	const Div: HTMLElement = createDiv("", "h-full w-[11%] rounded-xl flex items-center justify-center");
	setbackgroundImages(Div, "url('/game_ui/setting/emptyPan.png')");
	append(Div, [(createElement('p', "stubborn-id", `${textContent}` , "text-orange-200 text-center font-bold") as HTMLElement)])
	return Div;
}

function createStubborngameId(): HTMLElement{
	const IdDiv: HTMLElement = crateStubbornDiv(`ID`);
	return IdDiv;
}

function createStubbornPlayer(): HTMLElement {
	const PlayersDivs: HTMLElement = crateStubbornDiv(`Players`);
	return PlayersDivs;
}

function createStubbornBeginAt(): HTMLElement {
	const BeginAtDiv: HTMLElement = crateStubbornDiv(`Begin At`);
	return BeginAtDiv;
}

function createStubbornFinishedAt(): HTMLElement {
	const FinishAtDiv: HTMLElement = crateStubbornDiv(`Finished At`);
	return FinishAtDiv;
}

function createStubbornCreatedAt(): HTMLElement {
	const CreatedAtDivs: HTMLElement = crateStubbornDiv(`Created At`);
	return CreatedAtDivs;
}
function createStubbornCreatedBy(): HTMLElement {
	const CreatedAtDivs: HTMLElement = crateStubbornDiv(`Created By`);
	return CreatedAtDivs;
}

function createStubbornScore(): HTMLElement {
	const ScoreDiv: HTMLElement = crateStubbornDiv(`Score`);
	return ScoreDiv;
}

function createStubbornWinner(): HTMLElement {
	const WinnerDiv: HTMLElement = crateStubbornDiv(`Winner`);
	return WinnerDiv;
}

function createHistoryDiv(id: string) : HTMLElement {
	const Div = createDiv(id, "h-full w-[11%] border-2 border-orange-300 border-opacity-70 rounded-xl flex flex-col items-center justify-center gap-2");
	return Div;
}

function createGameId(PartyDiv: HTMLElement, i: number, Party: any) {
	const GameIdDivs = createHistoryDiv("Games-id" + i.toString()) as HTMLElement;
	append(GameIdDivs, [(createElement('h2', "id" + i.toString(), `#${Party.id}` , "text-emerald-600 text-center font-bold ") as HTMLElement)	]);

	append(PartyDiv, [GameIdDivs]);
}

function createPlayers(PartyDiv: HTMLElement, i: number, Party: any) {
		const PlayersDivs = createHistoryDiv("players" + i.toString()) as 		HTMLElement;
		append(PlayersDivs, [ (createElement('h2', "players-a" + i.toString(), `${Party.player_a}` , "text-emerald-600 text-center") as HTMLElement)
							, (createElement('h2', "players-vs" + i.toString(), `VS` , "text-emerald-600 text-center") as HTMLElement)
							, (createElement('h2', "players-b" + i.toString(), `${Party.player_b}` , "text-emerald-600 text-center") as HTMLElement)]);

		append(PartyDiv, [PlayersDivs]);
}

function createBeginAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const BeginAtDiv = createHistoryDiv("begin-at" + i.toString()) as HTMLElement;
	append(BeginAtDiv, [(createElement('h2', "begin" + i.toString(), `${Party.began_at}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [BeginAtDiv]);
}

function createFinishAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const FinishAtDiv = createHistoryDiv("finish-at" + i.toString()) as HTMLElement;
	append(FinishAtDiv, [(createElement('h2', "finish" + i.toString(), `${Party.finished_at}` , "text-emerald-600 text-center ") as HTMLElement)]);

	append(PartyDiv, [FinishAtDiv]);
}

function createCreatedAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const CreatedAtDivs = createHistoryDiv("created-at" + i.toString()) as HTMLElement;
	append(CreatedAtDivs, [(createElement('h2', "created" + i.toString(), `${Party.created_at}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [CreatedAtDivs]);
}

function createCreatedBy(PartyDiv: HTMLElement, i: number, UserName: string) {
	const CreatedBytDivs = createHistoryDiv("created-by" + i.toString()) as HTMLElement;
	append(CreatedBytDivs, [(createElement('h2', "created" + i.toString(), `${UserName}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [CreatedBytDivs]);
}

function createScore(PartyDiv: HTMLElement, i: number, Party: any) {
	const ScoreDiv = createHistoryDiv("score" + i.toString()) as HTMLElement;
	append(ScoreDiv, [(createElement('h2', "players-a" + i.toString(), `${Party.score_a}` , "text-emerald-600 text-center") as HTMLElement)
					, (createElement('h2', "players-a" + i.toString(), `-` , "text-emerald-600 text-center") as HTMLElement)
					, (createElement('h2', "players-a" + i.toString(), `${Party.score_b}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [ScoreDiv]);
}

function createWinner(PartyDiv: HTMLElement, i: number, Party: any) {
	const WinnerDiv = createHistoryDiv("winner" + i.toString()) as HTMLElement;
	append(WinnerDiv, [(createElement('h2', "players-a" + i.toString(), `${Party.winner}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [WinnerDiv]);
}