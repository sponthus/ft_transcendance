type AssetSuccess = { ok: true; asset: number };
type Failure = { ok: false; error: string };

export type AssetResult = AssetSuccess | Failure;

export async function   changeCharacterAsset (asset: number): Promise<AssetResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/character/asset', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ asset }),
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, asset: data.asset};
    }
    return { ok: false, error: data.error};
}

export async function   getCharacterAsset(): Promise<AssetResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/character/asset', 
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, asset: data.asset};
    }
    return { ok: false, error: data.error};
}
