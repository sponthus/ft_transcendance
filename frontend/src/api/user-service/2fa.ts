type Success = {ok: true, qrCode?: string, status?: string, token?: string}
type Failure = { ok: false; error: string };

export type Result = Success | Failure 

export async function  activateTwoFa(): Promise<Result>
{
    try
    {
        const res = await fetch('/api/user/2fa/setup', 
        {
            method: 'POST',
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, qrCode: data.qrCode });
        }
        return ( { ok: false, error: data.message } );
    }
    catch (err)
    {
        return ( { ok: false, error: "Network error" } );
    }
}

export async function  checkTwoFaCode(code: string): Promise<Result>
{
    try
    {
        const res = await fetch( "/api/user/2fa/check", 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, status: data.status });
        }
        return ({ ok: false, error: data.message });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}

export async function  desactivateTwoFa(): Promise<Result>
{
    try
    {
        const res = await fetch('/api/user/2fa/desactivate', 
        {
            method: 'POST',
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, status: data.status });
        }
        return ({ ok: false, error: data.message });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}