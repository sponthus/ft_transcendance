type AssetSuccess = { ok: true; asset?: number };
type Failure = { ok: false; error: string };

export type AssetResult = AssetSuccess | Failure;

export async function   changeCharacterAsset (asset: number): Promise<AssetResult>
{ 
    const res = await fetch('/api/user/menu/character/asset', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ asset }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.message};
}

export async function   getCharacterAsset(): Promise<AssetResult>
{
    const res = await fetch('/api/user/menu/character/asset', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, asset: data.asset};
    }
    return { ok: false, error: data.message};
}
