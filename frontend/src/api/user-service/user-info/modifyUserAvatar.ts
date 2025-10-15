type Success = { ok: true };
type Failure = { ok: false; error: string };

export type Result = Success | Failure;


export async function   updateAvatar(avatar: string): Promise<Result>
{ 
    try
    {
        const res = await fetch('/api/user/user-info/avatar', 
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ avatar }),
        });
        if (res.ok)
        {
            return ({ ok: true });
        }
        const data = await res.json();
        return ({ ok: false, error: data.error });
    }
    catch (err)
    { 
        return ({ ok: false, error: "Network error" });
    }
}
