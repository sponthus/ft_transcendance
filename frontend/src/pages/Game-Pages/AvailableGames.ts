
import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append} from '../../Utils/elementMaker.js';
import { createLocalGame, getAvailableGames, startGame, deleteGame } from "../../api/game-service/games/game.js"
import { getUserInfo } from "../../api/user-service/user-info/getUserInfo.js";
import { getAvailableTournaments } from  "../../api/game-service/tournaments/getTournaments.js";
import { deleteTournament } from  "../../api/game-service/tournaments/deleteTournament.js";
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

export class availableGames {
	private Page!: HTMLElement;
	private PartyMap: Map<number, HTMLButtonElement>;
	private UserData!: any;
	private bodyParty!: HTMLElement;
	private TitleParty!: HTMLElement;
	private AvailableDiv!: HTMLElement;

	constructor(PartyMap: Map<number, HTMLButtonElement>) {
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
			ErrorPopup("error");
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
		console.log("refresh available games");
		this.PartyMap!.clear();
		// const BodyParty = document.getElementById("Body-Party-div")  as HTMLElement;
		this.bodyParty.innerHTML = '';
		// const availableGamesDiv = document.getElementById('available-games-div');
		if (!this.AvailableDiv  || !this.UserData?.id) {
			console.log('availableGames debug');
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
			console.log("tournament :", tournaments);
			// const TitlePartys = document.getElementById('Title-Party-p') as HTMLElement;
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
					PartyDiv.style.backgroundImage = "url('game_ui/setting/emptyPan.png')";
					PartyDiv.style.backgroundPosition = "center";
					PartyDiv.style.backgroundSize = '100% 100%';
					this.CreateGameIdDiv(PartyDiv, index, Party);
					this.CreateTournamentName(PartyDiv, index, Party);
					this.createCreatedAtDiv(PartyDiv, index, Party);
					append(this.bodyParty, [PartyDiv]);
					this.PartyMap.set(Party.id, PartyDiv);
				})
				this.ManagePartyEvent();
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

	private ManagePartyEvent() {
		// document.getElementById("delete-btn")?.addEventListener('click', async(e) => {
		// 	this.PartyMap?.forEach(async (value, key) => {
		// 		if (value.checked) {
		// 			await this.deleteTournament(key);
		// 			await this.refreshAvailableGames();
		// 			return ;
		// 		}
		// 	})
		// })
	}

	private async deleteTournament(tournamentId: number) {
		try {
			const request = await deleteTournament(tournamentId);
			if (!request.ok) {
				throw new Error(request.error);
			}
			ErrorPopup(request.message);
		} catch (error) {
			ErrorPopup(error as string);
		}
		await this.refreshAvailableGames();
	}
}
