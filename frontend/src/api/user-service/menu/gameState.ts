type GameStateSuccess = { ok: true; gameState?: number };
type Failure = { ok: false; error: string };

export type GameStateResult = GameStateSuccess | Failure;

export async function   changeGameState(gameState: number): Promise<GameStateResult>
{
    const res = await fetch('/api/user/menu/state', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gameState }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.message};
}

export async function   getGameState(): Promise<GameStateResult>
{
    const res = await fetch('/api/user/menu/state', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, gameState: data.gameState};
    }
    return { ok: false, error: data.message};
}
