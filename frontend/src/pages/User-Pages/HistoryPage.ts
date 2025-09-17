import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { getAllGames, getFinishedGames } from '../../api/game-service/games/game.js';
import { UserPage } from './UserPage.js';



export async function DisplayHistoryPage(Body: HTMLElement, UserData: any) {
	// Body.textContent = "i'm in the History body";
	Body.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-auto";
	try {
		const res = await getFinishedGames(UserData.slug);
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
			games.map((party: any, i: number) => {
				if (party.status == "finished") {
					const PartyDiv = createDiv("party-div", "flex items-center min-h-[150px] w-[100%] border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-400 hover:bg-opacity-50 space-x-8");
	
					createGameId(PartyDiv, i, party);
					createPlayers(PartyDiv, i, party);
					createBeginAt(PartyDiv, i, party);
					createFinishAt(PartyDiv, i, party);
					createCreatedAt(PartyDiv, i, party);
					createCreatedBy(PartyDiv, i, UserData.username);
					createScore(PartyDiv, i, party);;
					createWinner(PartyDiv, i, party);
						
					append(Body, [PartyDiv]);
				}
			})
		}

	}
	catch (error) {
		alert("error: " + error);
	}
}

function createHistoryDiv(id: string) : HTMLElement {
	const Div = createDiv(id, "h-full w-[11%] border-2 border-orange-300 border-opacity-70 rounded-xl grid grid-rows-4 items-center justify-center");
	return Div;
}

function createGameId(PartyDiv: HTMLElement, i: number, Party: any) {
	const GameIdDivs = createHistoryDiv("Games-id" + i.toString()) as HTMLElement;
	append(GameIdDivs, [(createElement('h2', "Games-id" + i.toString(), `Party :` , "text-emerald-600 text-center font-bold underline order-1") as HTMLElement)
						, (createElement('h2', "id" + i.toString(), `#${Party.id}` , "text-emerald-600 text-center font-bold row-start-3") as HTMLElement)	]);

	append(PartyDiv, [GameIdDivs]);
}

function createPlayers(PartyDiv: HTMLElement, i: number, Party: any) {
		const PlayersDivs = createHistoryDiv("players" + i.toString()) as 		HTMLElement;
		append(PlayersDivs, [(createElement('h2', "players" + i.toString(), `Players :` , "text-emerald-600 text-center font-bold underline ") as HTMLElement)
							, (createElement('h2', "players-a" + i.toString(), `${Party.player_a}` , "text-emerald-600 text-center") as HTMLElement)
							, (createElement('h2', "players-vs" + i.toString(), `VS` , "text-emerald-600 text-center") as HTMLElement)
							, (createElement('h2', "players-b" + i.toString(), `${Party.player_b}` , "text-emerald-600 text-center") as HTMLElement)]);

		append(PartyDiv, [PlayersDivs]);
}

function createBeginAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const BeginAtDiv = createHistoryDiv("begin-at" + i.toString()) as HTMLElement;
	append(BeginAtDiv, [(createElement('h2', "party-begin" + i.toString(), `Begin At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
						, (createElement('h2', "begin" + i.toString(), `${Party.began_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [BeginAtDiv]);
}

function createFinishAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const FinishAtDiv = createHistoryDiv("finish-at" + i.toString()) as HTMLElement;
	append(FinishAtDiv, [(createElement('h2', "party-finish" + i.toString(), `Finish At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
						, (createElement('h2', "finish" + i.toString(), `${Party.finished_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [FinishAtDiv]);
}

function createCreatedAt(PartyDiv: HTMLElement, i: number, Party: any) {
	const CreatedAtDivs = createHistoryDiv("created-at" + i.toString()) as HTMLElement;
	append(CreatedAtDivs, [(createElement('h2', "party-created" + i.toString(), `Created At : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
							, (createElement('h2', "created" + i.toString(), `${Party.created_at}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [CreatedAtDivs]);
}

function createCreatedBy(PartyDiv: HTMLElement, i: number, UserName: string) {
	const CreatedBytDivs = createHistoryDiv("created-by" + i.toString()) as HTMLElement;
	append(CreatedBytDivs, [(createElement('h2', "party-statue" + i.toString(), `Created By : `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
							, (createElement('h2', "created" + i.toString(), `${UserName}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [CreatedBytDivs]);
}

function createScore(PartyDiv: HTMLElement, i: number, Party: any) {
	const ScoreDiv = createHistoryDiv("score" + i.toString()) as HTMLElement;
	append(ScoreDiv, [(createElement('h2', "party-statue" + i.toString(), `Score: `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
					, (createElement('h2', "players-a" + i.toString(), `${Party.score_a}` , "text-emerald-600 text-center") as HTMLElement)
					, (createElement('h2', "players-a" + i.toString(), `-` , "text-emerald-600 text-center") as HTMLElement)
					, (createElement('h2', "players-a" + i.toString(), `${Party.score_b}` , "text-emerald-600 text-center") as HTMLElement)]);

	append(PartyDiv, [ScoreDiv]);
}

function createWinner(PartyDiv: HTMLElement, i: number, Party: any) {
	const WinnerDiv = createHistoryDiv("winner" + i.toString()) as HTMLElement;
	append(WinnerDiv, [(createElement('h2', "party-statue" + i.toString(), `Winner: `, "text-emerald-600 text-center underline font-bold") as HTMLElement)
						, (createElement('h2', "players-a" + i.toString(), `${Party.winner}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

	append(PartyDiv, [WinnerDiv]);
}