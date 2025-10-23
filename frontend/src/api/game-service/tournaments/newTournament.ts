type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

type TournamentInfos = {
	tournament_id: number;
	status: 'pending' | 'ongoing_game' | 'between_games' | 'canceled' | 'done' | 'invitations';
	name: string;
	numberOfPlayers: number;
	rounds: number;
	nextGameId: number;
	option: number;
	players: Array<string>;
}

type AllGamesInfos = {
    id: number;
    status: 'pending' | 'ongoing' | 'finished' | 'canceled' | 'invitations';
    player_a: string;
    player_b: string;
    score_a: number;
    score_b: number;
    tournament_id: number;
    created_at: string;
    began_at: string;
    finished_at: string;
    winner: string;
	maxScore: number;
	option: number;
}

type AllGamesList = { ok: true; games: AllGamesInfos[] }
export type AllGamesResult = AllGamesList | Failure;

type TournamentSuccess = { ok: true; tournament: TournamentInfos }
export type TournamentResult = TournamentSuccess | Failure;

export async function createTournament(name: string, playersList: Array<string>, option: number = 1): Promise<TournamentResult> {
	console.log('name', name, 'players list', playersList);

	try {
		const res = await fetch('/api/games/tournament', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'host': window.location.host
			},
            credentials: 'include',
			body: JSON.stringify({
				name: name,
				players: playersList,
				option: option
			})
		});
		const data = await res.json();
		if (res.ok) {
			return {
				ok: true,
				tournament: data,
			}
		} else {
			if (data.message)
				return { ok: false, error: data.message as string };
			else
				return { ok: false, error: "Unable to create tournament" };
		}
	}
	catch (error) {
		return { ok: false, error: error as string };
	}
}