
import { createDiv, createElement, createButton, append, setbackgroundImages} from '../../Utils/elementMaker.js';
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";
import { getAvailableTournaments, TournamentsInfos } from  "../../api/game-service/tournaments/getTournaments.js";
import { deleteTournament } from  "../../api/game-service/tournaments/deleteTournament.js";
import { ErrorPopup } from '../ErrorPage.js';

export class availableGames {
	private Page!: HTMLElement;
	private PartyMap: Map<TournamentsInfos, HTMLButtonElement>;
	private UserData!: any;
	private bodyParty!: HTMLElement;
	private TitleParty!: HTMLElement;
	private AvailableDiv!: HTMLElement;

	constructor(PartyMap: Map<TournamentsInfos, HTMLButtonElement>) {
		this.PartyMap = PartyMap;
		this.initUserInfo();
	}

	private async initUserInfo() {
		try {
			const req = await getUserInfo();
			if (req.ok) {
				this.UserData = req.userInfo;
			}

		} catch (error) {
			await ErrorPopup("error");
		}
	}

	render (parent: HTMLElement) {
		this.Page = parent
		this.createAvailableGame();
	}

	// create div for available games div 
	private async createAvailableGame() {
		this.AvailableDiv = createDiv("available-games", "flex flex-col items-center w-[90%] h-[90%] space-y-8 mb-auto translate-y-16");

		this.TitleParty = (createElement('p', "Title-Party", "", "text-center text-orange-200 text-2xl text-center w-[50%] h-[10%] font-bold border-4 rounded-xl translate-y-4 border-orange-200 shadow-xl") as HTMLElement)

		this.bodyParty =  (createDiv("Body-Party", "flex flex-wrap justify-around w-[80%] h-64 border-4 border-orange-200 rounded-xl shadow-xl overflow-auto gap-y-4 gap-x-4") as HTMLElement);
		// Append title, and body
		append(this.AvailableDiv , [this.TitleParty , this.bodyParty]);
		append(this.Page, [this.AvailableDiv ]);
	}


	async refreshAvailableGames() {
		/*************************here to call API get Availables tounrament********************************/
		this.PartyMap!.clear();
		this.bodyParty.innerHTML = '';
		if (!this.AvailableDiv  || !this.UserData?.id) {
			if(!this.AvailableDiv )
			   this.Page.innerHTML = `Error don't find availables games`;
			return;
		}
	
		try {
			const result = await getAvailableTournaments(this.UserData?.slug); // change for Available Tournament
			if (!result.ok) {
				this.AvailableDiv .innerHTML = 'Error loading games.';
				return;
			}
			const tournaments = result.tournaments;
			this.renderParty(tournaments);
		}
		catch (error) {
			console.error('Error fetching games:', error);
			this.AvailableDiv .innerHTML = '<p>Error loading games</p>';
		}
	}

	private renderParty(games: any) {
			if (games.length === 0) {
				this.TitleParty.textContent = 'No games available';
			}
			else {
				this.TitleParty.textContent = 'available Partys';
				games.map((Party: any, index: number) => {
					const PartyDiv: HTMLButtonElement = createButton("game-item" + index.toString(), "flex flex-wrap justify-around active:scale-95 hover:scale-105 w-[40%] h-[50%] gap-x-4 transition-all duration-200", '');
					setbackgroundImages(PartyDiv, "url('game_ui/setting/emptyPan.png')")
					this.CreateGameIdDiv(PartyDiv, index, Party);
					this.CreateTournamentName(PartyDiv, index, Party);
					this.createCreatedAtDiv(PartyDiv, index, Party);
					append(this.bodyParty, [PartyDiv]);
					this.PartyMap.set(Party, PartyDiv);
				})
				// this.ManagePartyEvent();
			}
	}

	private CreateGameIdDiv(Div: HTMLElement, index: number, Party: any) {
		const GameIdDivs = createDiv("party-item" + index.toString(), "w-full  h-[15%] flex items-center justify-center translate-y-4") as HTMLElement;

		append(GameIdDivs, [(createElement('h2', "party-item " + index.toString(), `Game #${Party.id}` , "text-orange-200  text-center underline font-bold") as HTMLElement)]);
		append(Div, [GameIdDivs]);
	}

	private CreateTournamentName(Div: HTMLElement, index: number, Party: any) {
		const TournamentNameDiv = createDiv("party-Players-Name" + index.toString(), "w-[30%] h-[70%] flex flex-col items-center justify-center overflow-hidden") as HTMLElement;

		append(TournamentNameDiv, [(createElement('h2', "tournament-Name" + index.toString(), "Name", "text-orange-200 text-center font-bold underline") as HTMLElement)
									, (createElement('h1', "tournament-Name" + index.toString(), ` ${Party.name}`, "text-orange-200 text-center") as HTMLElement)])

		append(Div, [TournamentNameDiv])
	}

	private createCreatedAtDiv(Div: HTMLElement, index: number, Party: any) {
		const CreatedAtDivs = createDiv("party-item" + index.toString(), "w-[40%] h-[70%] flex flex-col items-center justify-center overflow-hidden") as HTMLElement;
		
		append(CreatedAtDivs, [(createElement('h2', "party-statue" + index.toString(), `Created At `, "text-orange-200 text-center underline font-bold") as HTMLElement)
								, (createElement('h1', "party-statue" + index.toString(), `${Party.created_at}`, "text-orange-200") as HTMLElement)]);
		append(Div, [CreatedAtDivs]);
	}
}
