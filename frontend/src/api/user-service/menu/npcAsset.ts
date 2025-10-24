type AssetSuccess = { ok: true; asset?: number };
type Failure = { ok: false; error: string };

export type AssetResult = AssetSuccess | Failure;

export async function   changeNpcAsset (asset: number): Promise<AssetResult>
{ 
    try
    {
        const res = await fetch('/api/user/menu/npc/asset', 
        {
            method: 'PATCH',
            headers:
            { 
			    'Content-Type': 'application/json',
			    'host': window.location.host
		    },
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
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}

export async function   getNpcAsset(): Promise<AssetResult>
{
    try
    {
        const res = await fetch('/api/user/menu/npc/asset', 
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
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}
