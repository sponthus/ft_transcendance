import { ErrorPopup } from "../../../pages/ErrorPage.js";

type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

// When a game is created or launched, it gives its info, including maxScore and if it's part of a tournament
type GameInfoResult =
    | { ok: true; gameId: number, status: string, player_a: string, player_b: string, maxScore: number, tournament_id: number, ai: number, option: number }
    | Failure

type PendingGamesInfos = {
    id: number;
    status: 'pending' | 'ongoing' | 'finished' | 'canceled';
    player_a: string;
    player_b: string;
    created_at: string;
	created_by: string;
	ai: number;
	option: number;
}

export type AllGamesInfos = {
    id: number;
    status: 'pending' | 'ongoing' | 'finished' | 'canceled';
    player_a: string;
    player_b: string;
    score_a: number;
    score_b: number;
    tournament_id: number;
    created_at: string;
	created_by: string;
    began_at: string;
    finished_at: string;
    winner: string;
	ai: number;
	option: number;
}

type AvailableGamesList = { ok: true; games: PendingGamesInfos[] }
export type AvailableGamesResult = AvailableGamesList | Failure;

type AllGamesList = { ok: true; games: AllGamesInfos[]; stats: { wins: number; losses: number; total: number } }
export type AllGamesResult = AllGamesList | Failure;

// All routes going to game service begin with : "/api/games/"

// POST /game
// Creates a new game for the user, taking names for players
// Security : Accessible for every logged-in user
export async function createLocalGame(player_a: string, player_b: string, maxScore: number = 7, ai: number = 0, option: number = 1): Promise<GameInfoResult> {    
    console.log(' playA ' + player_a + ' playB ' + player_b);
    const res = await fetch('/api/games/game', {
        method: 'POST',
        headers: {
			'Content-Type': 'application/json',
			'host': window.location.host
		},
        credentials: 'include',
        body: JSON.stringify({
            player_a: player_a,
            player_b: player_b,
			requestedMaxScore: maxScore,
			requestedAi: ai,
			requestedOption: option
        })
    });
    const data = await res.json();

    if (res.ok) {
        return {
            ok: true,
            gameId: data.gameId,
            status: data.status,
            player_a: data.player_a,
            player_b: data.player_b,
			tournament_id: data.tournament,
			maxScore: data.maxScore,
			ai: ai,
			option: option
        };
    } else {
        // Invalid or expired token = Disconnect
        await ErrorPopup("❌ API Error starting game : " + data?.error as string  || "Game start impossible");
        return { ok: false, error: data?.error as string  || "Game start impossible" };
    }
}

// POST /:game_id
// Response: {
//   game_id: number,
//   status: "ongoing",
//   players: [string, string]
// }
// Launch a game and reserve a game server in backend
// Security : is gonna be possible only if the logges-in user is the owner of the game
export async function startGame(gameId: number): Promise<GameInfoResult> {
	if (!gameId) {
        return { ok: false, error: "No game ID given" };
    }
    try {
        const request = await fetch(`/api/games/${gameId}`, {
            method: 'POST',
			headers: {
				'host': window.location.host
			},
            credentials: 'include',
        });
        if (!request.ok) {
            throw new Error('Unable to start game ' + request.status);
        }
        const data = await request.json();
        return { ok: true, 
			gameId: data.game_id, 
			status: data.status, 
			player_a: data.player_a, 
			player_b: data.player_b, 
			tournament_id: data.tournament_id, 
			maxScore: data.maxScore,
			ai: data.ai,
			option: data.option
		};
    }
    catch (error) {
        return { ok: false, error: error as string  };
    }
}

// GET /:slug/games
// All available PENDING non-tournament games for a user, gives only useful infos
// Security : Accessible for every logged-in user
export async function getAvailableGames(slug: string): Promise<AvailableGamesResult> {
    try {
        const allGamesResult = await getAllGames(slug);
        if (!allGamesResult.ok) {
            return { ok: false, error: allGamesResult.error };
        }
        const pendingGames: PendingGamesInfos[] = allGamesResult.games
            .filter(game => game.status === 'pending')
			.filter(game => game.tournament_id == 0)
            .map(game => ({
                id: game.id,
                status: game.status,
                player_a: game.player_a,
                player_b: game.player_b,
                created_at: game.created_at,
				created_by: game.created_by,
				ai: game.ai,
				option: game.option
            }));

        return { ok: true, games: pendingGames };

    } catch (error) {
        console.error('❌ Error filtering pending games', error as string );
        return { ok: false, error: error as string  };
    }
}

function countLosses(games: AllGamesInfos[], slug: string): number {
	return games
		.filter(game => game.winner !== `@${slug}` 
			&& (game.player_a === `@${slug}` 
				|| game.player_b === `@${slug}`))
				.length;
}

function countWins(games: AllGamesInfos[], slug: string): number {
    return games
		.filter(game => game.winner === `@${slug}`)
		.length;
}

// GET /:slug/games
// All available FINISHED games for a user, gives only useful infos
// Security : Accessible for every logged-in user
export async function getFinishedGames(slug: string): Promise<AllGamesResult> {
    try {
        const allGamesResult = await getAllGames(slug);
        if (!allGamesResult.ok) {
            return { ok: false, error: allGamesResult.error };
        }
        const finishedGames: AllGamesInfos[] = allGamesResult.games
            .filter(game => game.status === 'finished')
            .map(game => ({
                id: game.id,
                status: game.status,
                player_a: game.player_a,
                player_b: game.player_b,
				winner: game.winner,
                created_at: game.created_at,
				created_by: game.created_by,
				began_at: game.began_at,
				finished_at: game.finished_at,
				score_a: game.score_a,
				score_b: game.score_b,
				tournament_id: game.tournament_id,
				ai: game.ai,
				option: game.option
            }));
		const countGames = finishedGames.length;
		const wins = countWins(finishedGames, slug);
		const losses = countLosses(finishedGames, slug);
        // alert(`Finished games stats:\nTotal: ${countGames}\nWins: ${wins}\nLosses: ${losses}`);
		return { ok: true, games: finishedGames, stats: { wins: wins, losses: losses, total: countGames } };

    } catch (error) {
        console.error('❌ Error filtering finished games', error as string );
        return { ok: false, error: error as string  };
    }
}


// GET /:slug/games
// Gives all games for a user (useful for history, gives you every info available on each game)
// Security : Accessible for every logged-in user
export async function getAllGames(slug: string): Promise<AllGamesResult> {
    if (!slug) {
        return { ok: false, error: 'Slug is required' };
    }
    try {
        const response = await fetch(`/api/games/${slug}/games`, {
            method: 'GET',
            headers: {
				'host': window.location.host
			},
            credentials: 'include',
        });

        if (!response.ok) {
			const data = await response.json();
			if (data?.error)
				return { ok: false, error: data.error as string };
			else
            	return { ok: false, error: "Unable to get games" };
        }

        const games: AllGamesInfos[] = await response.json();
		console.log(games);
        return { ok: true, games: games, stats: { wins: 0, losses: 0, total: 0 } };

    } catch (error) {
        console.error('❌ Error fetching available games:', error);
        return { ok: false, error: error as string  };
    }
}

// DELETE /:gameId
// Delete a game in backend, actually not implemented in frontend
// Security : is gonna be possible only if the logges-in user is the owner of the game
export async function deleteGame(gameId: number): Promise<SimpleResult> {
    if (!gameId)
        return {ok: false, error: 'gameId required'};
    try {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'DELETE',
			headers: { 
				'host': window.location.host
			},
            credentials: 'include',
        });
        if (!response.ok) {
			const data = await response.json();
			return { ok: false, error: data?.error as string  || 'Unable to delete game' };
        }
        return { ok: true, message: 'Game has been deleted' };
    } catch(error) {
        return { ok: false, error: error as string  };
    }
}