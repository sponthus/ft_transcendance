type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

type GameInfoResult =
    | { ok: true; gameId: number, status: string, player_a: string, player_b: string }
    | Failure

type PendingGamesInfos = {
    id: number;
    status: 'pending' | 'ongoing' | 'finished' | 'canceled';
    player_a: string;
    player_b: string;
    created_at: string;
}

type AllGamesInfos = {
    id: number;
    status: 'pending' | 'ongoing' | 'finished' | 'canceled';
    id_user: number,
    player_a: string;
    player_b: string;
    score_a: number;
    score_b: number;
    tournament_id: number;
    created_at: string;
    began_at: string;
    finished_at: string;
    winner: string;
}

type AvailableGamesList = { ok: true; games: PendingGamesInfos[] }
export type AvailableGamesResult = AvailableGamesList | Failure;

type AllGamesList = { ok: true; games: AllGamesInfos[] }
export type AllGamesResult = AllGamesList | Failure;

// POST /games/game request creates a new game for the user, taking names for players
export async function createLocalGame(userId: number, player_a: string, player_b: string): Promise<GameInfoResult> {
    // TODO = Log check not functional
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error: "No token"};

    console.log('userId = ' + userId + ' playA ' + player_a + ' playB ' + player_b);
    const res = await fetch('/api/games/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            userId: userId,
            player_a: player_a,
            player_b: player_b,
        })
    });
    const data = await res.json();

    if (res.ok) {
        return {
            ok: true,
            gameId: data.game_id,
            status: data.status,
            player_a: data.player_a,
            player_b: data.player_b,
        };
    } else {
        // Invalid or expired token = Disconnect
        alert("API Error starting game : " + data?.error as string  || "Game start impossible");
        return { ok: false, error: data?.error as string  || "Game start impossible" };
    }
}

// POST /:game_id to launch a game and reserve game server in backend
// Response: {
//   game_id: number,
//   status: "ongoing",
//   players: [string, string]
// }
export async function startGame(gameId: number): Promise<GameInfoResult> {
    // TODO = Add log check

    if (!gameId) {
        return { ok: false, error: "No game ID given" };
    }
    try {
        const request = await fetch(`/api/games/${gameId}`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                // Auth header
            }
        });
        if (!request.ok) {
            throw new Error('Unable to start game ' + request.status);
        }
        const data = await request.json();
        return { ok: true, gameId: data.game_id, status: data.status, player_a: data.player_a, player_b: data.player_b };
    }
    catch (error) {
        return { ok: false, error: error as string  };
    }
}

// GET /:userId/games = all available PENDING games for a user, gives only useful infos
export async function getAvailableGames(userId: number): Promise<AvailableGamesResult> {
    try {
        const allGamesResult = await getAllGames(userId);
        if (!allGamesResult.ok) {
            return { ok: false, error: allGamesResult.error };
        }
        const pendingGames: PendingGamesInfos[] = allGamesResult.games
            .filter(game => game.status === 'pending')
            .map(game => ({
                id: game.id,
                status: game.status,
                player_a: game.player_a,
                player_b: game.player_b,
                created_at: game.created_at
            }));

        return { ok: true, games: pendingGames };

    } catch (error) {
        console.error('error filtering pending games', error as string );
        return { ok: false, error: error as string  };
    }
}

// GET /:userId/games = all games for a user (useful for history, gives you every info available on each game)
export async function getAllGames(userId: number): Promise<AllGamesResult> {
    // TODO = Add log check

    if (!userId) {
        return { ok: false, error: 'User ID is required' };
    }
    try {
        const response = await fetch(`/api/games/${userId}/games`, {
            method: 'GET',
            headers: {
                // 'Content-Type': 'application/json',
                // Auth header
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const games: AllGamesInfos[] = await response.json();

        return { ok: true, games: games };

    } catch (error) {
        console.error('Error fetching available games:', error);
        return { ok: false, error: error as string  };
    }
}

export async function deleteGame(gameId: number): Promise<SimpleResult> {
    // TODO = Add log check
    if (!gameId)
        return {ok: false, error: 'gameId required'};
    try {
        const response = await fetch(`/api/games/${gameId}`, {
            method: 'DELETE',
            headers:  {
                // Auth header
            }
        });
        if (!response.ok) {
            throw new Error(`Unable to delete game because ` + response.status);
        }
        return { ok: true, message: gameId + ' game has been deleted' };
    } catch(error) {
        return { ok: false, error: error as string  };
    }
}