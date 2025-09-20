type GameStateSuccess = { ok: true; gameState?: number };
type Failure = { ok: false; error: string };

export type GameStateResult = GameStateSuccess | Failure;

export async function   changeGameState(gameState: number): Promise<GameStateResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"}; //évite aller retour réseau
    const res = await fetch('/api/user/menu/state', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gameState }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error};
}

export async function   getGameState(): Promise<GameStateResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/state', 
    {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, gameState: data.gameState};
    }
    return { ok: false, error: data.error};
}
