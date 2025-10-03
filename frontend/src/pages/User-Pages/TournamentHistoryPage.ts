import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { getAllGames, getFinishedGames } from '../../api/game-service/games/game.js';
import { getAllTournaments, getTournamentMatches } from '../../api/game-service/tournaments/getTournaments.js';
import { UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { FillHistory } from './HistoryPage.js';
import { UserPage } from './UserPage.js';


let btnsMap: Map<HTMLButtonElement, HTMLElement> = new  Map<HTMLButtonElement, HTMLElement>();
let isopen: boolean;

export async function DisplayeTournamentHistoryPage(Body: HTMLElement, UserData: UserInfo) {
	isopen = false;
	Body.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-auto";
	try {
		const res = await getAllTournaments(UserData.slug!);
		if (!res.ok) {
			Body.textContent = "Error loading games... please retry ";
			return ;
		}
		const games = res.tournaments;
		if (games.length === 0) {
			Body.textContent = "there is no games";
		}
		else {
			fillStubborn(Body);
			games.map((party: any, i: number) => {
				if (party.status == "done") {
					const PartyPan = createDiv('tournament-pan', "flex flex-col items-center w-full h-[0%] flex gap-4 opacity-0 transition-all duration-300");
					FillPartyTournament(PartyPan, party, UserData);
					const PartyDiv: HTMLButtonElement = createButton("tournament", "flex items-center h-[10%] w-[100%] hover:scale-105 active:scale-95 hover:bg-orange-400 hover:bg-opacity-50 space-x-8 transition-all duration-300", "");

					createGameId(PartyDiv, i, party);
					createBeginAt(PartyDiv, i, party);
					createFinishAt(PartyDiv, i, party);
					createCreatedAt(PartyDiv, i, party);
					createCreatedBy(PartyDiv, i, UserData.username);
					createWinner(PartyDiv, i, party);
					
					btnsMap.set(PartyDiv, PartyPan);
					append(Body, [PartyDiv, PartyPan]);
				}
			})
			manageBtnsEvent();
		}
	}
	catch (error) {
		alert("error: " + error);
	}
}

async function FillPartyTournament(Body: HTMLElement, games:any, UserData: UserInfo) {
	try {
		const data = await getTournamentMatches(games.id!);
		if (data.ok) {
			const Matchs = data.matches;
			FillHistory(Body, Matchs, UserData);
		}
	} catch(error) {
		alert(error);
	}
}

function fillStubborn(body: HTMLElement) {
	const StubborndDiv = createDiv("Stubborn-div", "flex items-center h-[10%] w-[100%] space-x-8");
	append(StubborndDiv, [createStubborngameId(), createStubbornBeginAt(), createStubbornFinishedAt(), createStubbornCreatedAt(),createStubbornCreatedBy(), createStubbornWinner()]);
	append(body, [StubborndDiv]);

}

function crateStubbornDiv(textContent: string): HTMLElement {
	const Div: HTMLElement = createDiv("", "h-full w-[30%] rounded-xl flex items-center justify-center");
	Div.style.backgroundImage = "url('/game_ui/setting/emptyPan.png')";
	Div.style.backgroundSize = "100% 100%";
	Div.style.backgroundPosition = "center";
	append(Div, [(createElement('p', "stubborn-id", `${textContent}` , "text-orange-200 text-center font-bold") as HTMLElement)])
	return Div;
}

function createStubborngameId(): HTMLElement{
	const IdDiv: HTMLElement = crateStubbornDiv(`ID`);
	return IdDiv;
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

function createStubbornWinner(): HTMLElement {
	const WinnerDiv: HTMLElement = crateStubbornDiv(`Winner`);
	return WinnerDiv;
}

function createHistoryDiv(id: string) : HTMLElement {
	const Div = createDiv(id, "h-full w-[30%] border-2 border-orange-300 border-opacity-70 rounded-xl grid grid-rows-4 items-center justify-center");
	return Div;
}

function createGameId(PartyDiv: HTMLElement, i: number, Party: any) {
	const GameIdDivs = createHistoryDiv("Games-id" + i.toString()) as HTMLElement;
	append(GameIdDivs, [(createElement('h2', "id" + i.toString(), `#${Party.id}` , "text-emerald-600 text-center font-bold row-start-3") as HTMLElement)	]);

	append(PartyDiv, [GameIdDivs]);
}

function createBeginAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const BeginAtDiv = createHistoryDiv("begin-at" + i.toString()) as HTMLElement;
	append(BeginAtDiv, [(createElement('h2', "begin" + i.toString(), `${Party.began_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [BeginAtDiv]);
}

function createFinishAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const FinishAtDiv = createHistoryDiv("finish-at" + i.toString()) as HTMLElement;
	append(FinishAtDiv, [(createElement('h2', "finish" + i.toString(), `${Party.finished_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [FinishAtDiv]);
}

function createCreatedAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const CreatedAtDivs = createHistoryDiv("created-at" + i.toString()) as HTMLElement;
	append(CreatedAtDivs, [(createElement('h2', "created" + i.toString(), `${Party.created_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [CreatedAtDivs]);
}

function createCreatedBy(PartyDiv: HTMLElement, i: number, UserName: string) {
	const CreatedBytDivs = createHistoryDiv("created-by" + i.toString()) as HTMLElement;
	append(CreatedBytDivs, [(createElement('h2', "created" + i.toString(), `${UserName}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [CreatedBytDivs]);
}

function createWinner(PartyDiv: HTMLElement, i: number, Party: any) {
	const WinnerDiv = createHistoryDiv("winner" + i.toString()) as HTMLElement;
	append(WinnerDiv, [(createElement('h2', "players-a" + i.toString(), `${Party.winner}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [WinnerDiv]);
}

function manageBtnsEvent() {
	btnsMap.forEach((value, key) => {
		key.addEventListener('click', () => {
			console.log("is open ? ", isopen);
			if (!isopen) {
				btnsMap.forEach((value1, key1) => {
					if (key1 != key) {
						closePan(value1);
					}
				})
				openPan(value);
				console.log("openPan ? ", isopen);
				isopen = true
			}
			else {
				closePan(value);
			}
		})
	})
}

function openPan(Pan: HTMLElement) {
	Pan.className = "flex flex-col items-center w-full h-[90%] flex gap-4 transition-all duration-300";
}

function closePan(Pan: HTMLElement) {
	isopen = false;
	Pan.className = "flex flex-col items-center w-full h-[0%] flex gap-4 opacity-0 transition-all duration-300";
}