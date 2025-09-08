type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

type TournamentsInfos = {
	id: number;
	status: 'pending' | 'ongoing_game' | 'between-games' | 'canceled' | 'done';
	name: string;
	next_game: number;
	created_at: string;
	began_at: string;
	finished_at: string;
	winner: string;
}

type TournamentsList = { ok: true; tournaments: TournamentsInfos[] }
export type TournamentsResult = TournamentsList | Failure;

// GET /:userId/tournaments
// All available tournaments for a user, no filter
// Security : Accessible for every logged-in user
export async function getAllTournaments(userId: number):  Promise<TournamentsResult> {
	const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error: "No token"};
    if (!userId) {
        return { ok: false, error: 'User ID is required' };
    }
    try {
        const response = await fetch(`/api/games/${userId}/tournaments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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

// GET /:userId/tournaments
// All available tournaments for a user, filtered = 
// Security : Accessible for every logged-in user
export async function getAvailableTournaments(userId: number): Promise<TournamentsResult> {
	try {
		const allTournamentsResult = await getAllTournaments(userId);
		if (!allTournamentsResult.ok) {
			return { ok: false, error: allTournamentsResult.error };
		}
		const pendingTournaments: TournamentsInfos[] = allTournamentsResult.tournaments
			.filter(tournament => tournament.status === 'pending' || tournament.status === 'between-games')
			.map(tournament => ({
				id: tournament.id,
				status: tournament.status,
				name: tournament.name,
				next_game: tournament.next_game,
				created_at: tournament.created_at,
				began_at: tournament.began_at,
				finished_at: tournament.finished_at,
				winner: tournament.winner
			}));

		return { ok: true, tournaments: pendingTournaments };

	} catch (error) {
		console.error('❌ Error filtering pending games', error as string );
		return { ok: false, error: error as string  };
	}
}