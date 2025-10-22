import { createDiv, createElement, createButton, append, setbackgroundImages, createImage} from '../../Utils/elementMaker.js';
import {  getTournamentMatches, GameInfos, getFinishedTournaments } from '../../api/game-service/tournaments/getTournaments.js';
import { getUserInfoBySlug, UserInfo } from '../../api/user-service/user-info/getUserInfo.js';
import { FillHistory, fillHistoryStubborn } from './HistoryPage.js';
import { ErrorPopup } from '../ErrorPage.js';
import { AllNotifs, getAllNotifications } from '../../api/user-service/menu/notifications/getNotifications.js';
import { acceptTournamentinvitation, declineTournamentInvitation } from '../../Utils/notification.js';



let btnsMap: Map<HTMLButtonElement, HTMLElement> = new  Map<HTMLButtonElement, HTMLElement>();
let isopen: boolean;
let isInvite: boolean

export async function DisplayeTournamentHistoryPage(Body: HTMLElement, UserData: UserInfo, isOwnProfile: boolean) {
	isopen = false;
	isInvite = false;
	Body.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-auto";
	if (isOwnProfile)
		await addInvitationTournament(Body);
	await AddTournaments(Body, UserData);
}

async function addInvitationTournament(Body: HTMLElement) {
	try {
		const req = await getAllNotifications()
		if (!req.ok)
			throw new Error(req.error);
		const ReceiveRequest = req.notifs;
		ReceiveRequest.forEach(notif => {
			if (notif.notif_type === "tournament_invite") {
				isInvite = true;
				addNotification(Body, notif)
			}
		})

	} catch(error) {
		await ErrorPopup(error as string);
	}
}

async function addNotification(body: HTMLElement, notif: AllNotifs) {
	let UserData: UserInfo;
	try {
		const req = await getUserInfoBySlug(notif.slug);
		if (!req.ok)
			throw new Error(req.error);
		UserData = req.userInfo;
		const notifDiv: HTMLElement = createDiv('invitation', 'flex items-center h-[30%] justify-around w-full hover:bg-orange-400 hover:bg-opacity-50 space-x-8 transition-all duration-300 gap-4');
		
		const srcImg = `https://${window.location.hostname}:4443/uploads/${UserData.avatar}`;

		const userIcon: HTMLElement = createDiv(`user-notification-icon-${UserData.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full shadow-xl w-[9%] aspect-square group-hover:shadow-lg transition-all duration-200 transform');
		append(userIcon, [(createImage(`user-notification-${UserData.slug}`, 'w-[90%] aspect-square rounded-full object-cover object-center', `${srcImg}?t=${Date.now()}`) as HTMLImageElement)]);
		const invitationTextDiv = createDiv(`invitation-text-${UserData.slug}`, 'flex flex-col items-center');
		invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">user ${UserData.username} invite you to play tournament ${notif.notif_tournament_name}</p>`;

		const btnDiv = createDiv(`btn-invitation-${UserData.slug}`, 'flex items-center justify-between space-x-8') as HTMLElement;

		let accept: HTMLButtonElement= (createButton(`accept-${UserData.slug}`, 'px-4 text-orange-100 bg-emerald-600 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-emerald-700 transition-all duration-200', 'accept') as HTMLButtonElement);
		let decline: HTMLButtonElement = (createButton(`decline-${UserData.slug}`, 'px-4 text-orange-100 bg-red-500 rounded-xl group-hover:text-orange-200 hover:font-bold hover:bg-red-600 transition-all duration-200', 'decline') as HTMLButtonElement);
		append(btnDiv, [accept, decline]);
		append(invitationTextDiv, [btnDiv]);

		append(notifDiv, [userIcon, invitationTextDiv]);
		append(body, [notifDiv]);
		acceptTournamentinvitation(accept, notif);
		declineTournamentInvitation(decline, notif);

	} catch(error) {
		await ErrorPopup(error as string);
	}

}

async function AddTournaments(Body: HTMLElement, UserData: UserInfo) {
	try {
		const res = await getFinishedTournaments(UserData.slug!);
		if (!res.ok) {
			Body.textContent = "Error loading games... please retry ";
			return ;
		}
		const games = res.tournaments;
		if (games.length === 0) {
			if (isInvite === false)
				Body.textContent = "There is no tournaments";
		}
		else {
			fillTournamentStubborn(Body);
			games.map((party: any, i: number) => {
				if (party.status == "done") {
					const PartyPan = createDiv('tournament-pan', "flex flex-col items-center w-full h-[0%] flex gap-4 opacity-0 transition-all duration-300");
					FillPartyTournament(PartyPan, party);
					const PartyDiv: HTMLButtonElement = createButton("tournament", "flex items-center h-[10%] w-[100%] hover:scale-105 active:scale-95 hover:bg-orange-400 hover:bg-opacity-50 space-x-8 transition-all duration-300", "");

					createGameId(PartyDiv, i, party);
					createBeginAt(PartyDiv, i, party);
					createFinishAt(PartyDiv, i, party);
					createCreatedAt(PartyDiv, i, party);
					createCreatedBy(PartyDiv, i, party);
					createWinner(PartyDiv, i, party);
					
					btnsMap.set(PartyDiv, PartyPan);
					append(Body, [PartyDiv, PartyPan]);
				}
			})
			manageBtnsEvent();
		}
	}
	catch (error) {
		await ErrorPopup("error: " + error);
	}
}

async function FillPartyTournament(Body: HTMLElement, games:any) {
	try {
		const data = await getTournamentMatches(games.id!);
		if (data.ok) {
			const Matchs = data.matches;
			fillHistoryStubborn(Body);
			Matchs.map((match: GameInfos, i: number) => {FillHistory(Body, match, i);});
		}
	} catch(error) {
		await ErrorPopup(error as string);
	}
}

function fillTournamentStubborn(body: HTMLElement) {
	const StubborndDiv = createDiv("Stubborn-div", "flex items-center h-[10%] w-[100%] space-x-8");
	append(StubborndDiv, [createStubborngameId(), createStubbornBeginAt(), createStubbornFinishedAt(), createStubbornCreatedAt(),createStubbornCreatedBy(), createStubbornWinner()]);
	append(body, [StubborndDiv]);

}

function crateStubbornDiv(textContent: string): HTMLElement {
	const Div: HTMLElement = createDiv("", "h-full w-[30%] rounded-xl flex items-center justify-center");
	setbackgroundImages(Div, "url('/game_ui/setting/emptyPan.png')");
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

function createCreatedBy(PartyDiv: HTMLElement, i: number, Party: any) {
	const CreatedBytDivs = createHistoryDiv("created-by" + i.toString()) as HTMLElement;
	append(CreatedBytDivs, [(createElement('h2', "created" + i.toString(), `${Party.created_by}` , "text-emerald-600 text-center row-start-3") as HTMLElement)]);

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
			if (!isopen) {
				btnsMap.forEach((value1, key1) => {
					if (key1 != key) {
						closePan(value1);
					}
				})
				openPan(value);
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