type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

export type TournamentsInfos = {
	id: number;
	status: 'pending' | 'invitations' | 'ongoing_game' | 'between_games' | 'canceled' | 'done';
	name: string;
	next_game: number;
	created_at: string;
	created_by: string;
	began_at: string;
	finished_at: string;
	winner: string;
	option: number;
}

type TournamentsList = { ok: true; tournaments: TournamentsInfos[] }
export type TournamentsResult = TournamentsList | Failure;

export type GameInfos = {
	id: number; // game_id
    round: number;
	match: number;
	status: 'pending' | 'ongoing' | 'finished' | 'canceled';
    player_a: string;
    player_b: string;
    score_a: number;
    score_b: number;
	created_at: string;
	created_by: string;
    began_at: string;
    finished_at: string;
    winner: string;
	score: number;
	option: number
}

type TournamentMatches = { ok: true; matches: GameInfos[] }
export type TournamentMatchesResult = TournamentMatches | Failure;

type NextMatchData = {
	game_id: number;
	players: string[];
	round: number;
	match: number;
}
type TournamentNextMatch = { ok: true; next_match: NextMatchData }
type TournamentNextMatchResult = TournamentNextMatch | Failure;

// GET /:slug/tournaments
// All available tournaments for a user, no filter
// Security : Accessible for every logged-in user
export async function getAllTournaments(slug: string):  Promise<TournamentsResult> {
    if (!slug) {
        return { ok: false, error: 'Slug is required' };
    }
    try {
        const response = await fetch(`/api/games/${slug}/tournaments`, {
            method: 'GET',
            headers: {
				'host': window.location.host
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const games: TournamentsInfos[] = await response.json();

        return { ok: true, tournaments: games };

    } catch (error) {
        console.error('❌ Error fetching available tournaments : ', error);
        return { ok: false, error: error as string  };
    }
}

// GET /:slug/tournaments
// All available tournaments for a user, filtered = pending, between_games
// Security : Accessible for every logged-in user
export async function getAvailableTournaments(slug: string): Promise<TournamentsResult> {
	try {
		const allTournamentsResult = await getAllTournaments(slug);
		if (!allTournamentsResult.ok) {
			return { ok: false, error: allTournamentsResult.error };
		}
		const pendingTournaments: TournamentsInfos[] = allTournamentsResult.tournaments
			.filter(tournament => tournament.status === 'pending' || tournament.status === 'invitations' || tournament.status === 'between_games')
			.filter(tournament => tournament.created_by && tournament.created_by.slice(1) == slug) // Exclude tournaments not created by the user
			.map(tournament => ({
				id: tournament.id,
				status: tournament.status,
				name: tournament.name,
				next_game: tournament.next_game,
				created_at: tournament.created_at,
				created_by: tournament.created_by,
				began_at: tournament.began_at,
				finished_at: tournament.finished_at,
				winner: tournament.winner,
				option: tournament.option
			}));
		return { ok: true, tournaments: pendingTournaments };

	} catch (error) {
		console.error('❌ Error filtering pending tournaments', error as string );
		return { ok: false, error: error as string  };
	}
}

// GET /:slug/tournaments
// All available tournaments for a user, filtered = done
// Security : Accessible for every logged-in user
export async function getFinishedTournaments(slug: string): Promise<TournamentsResult> {
	try {
		const allTournamentsResult = await getAllTournaments(slug);
		if (!allTournamentsResult.ok) {
			return { ok: false, error: allTournamentsResult.error };
		}
		const finishedTournaments: TournamentsInfos[] = allTournamentsResult.tournaments
			.filter(tournament => tournament.status === 'done')
			.map(tournament => ({
				id: tournament.id,
				status: tournament.status,
				name: tournament.name,
				next_game: tournament.next_game,
				created_at: tournament.created_at,
				created_by: tournament.created_by,
				began_at: tournament.began_at,
				finished_at: tournament.finished_at,
				winner: tournament.winner,
				option: tournament.option
			}));
		return { ok: true, tournaments: finishedTournaments };

	} catch (error) {
		console.error('❌ Error filtering finished tournaments', error as string );
		return { ok: false, error: error as string  };
	}
}

// GET /:tournamentId
// All matches from a tournament
// Security : Accessible for every logged-in user
export async function getTournamentMatches(tournamentId: number): Promise<TournamentMatchesResult> {
	if (!tournamentId) {
        return { ok: false, error: 'Tournament ID is required' };
    }
	try {
        const response = await fetch(`/api/games/${tournamentId}`, {
            method: 'GET',
            headers: {
                'host': window.location.host
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const games: GameInfos[] = await response.json();
        return { ok: true, matches: games };

    } catch (error) {
        console.error('❌ Error fetching tournament matches : ', error);
        return { ok: false, error: error as string  };
    }
}

// GET /:tournamentId
// All matches from a tournament
// Security : Accessible for every logged-in user
export async function getTournamentNextMatch(tournamentId: number): Promise<TournamentNextMatchResult> {
	if (!tournamentId) {
        return { ok: false, error: 'Tournament ID is required' };
    }
	try {
        const response = await fetch(`/api/games/${tournamentId}/next-match`, {
            method: 'GET',
            headers: {
				'host': window.location.host
            },
            credentials: 'include'
        });

        if (!response.ok) {
			const data = await response.json();
            throw new Error(data.error);
        }

		const data = await response.json();
        return { ok: true, next_match: data };

    } catch (error) {
        console.error('❌ Error fetching next tournament match : ', error);
        return { ok: false, error: error as string  };
    }
}
