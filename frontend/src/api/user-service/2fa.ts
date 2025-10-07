type Success = {ok: true, qrCode?: string, status?: string, token?: string}
type Failure = { ok: false; error: string };

export type Result = Success | Failure 

export async function  activateTwoFa(): Promise<Result>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    const res = await fetch('/api/user/2fa/setup', 
    {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok)
    {
        return ({ ok: true, qrCode: data.qrCode });
    }
    return ( { ok: false, error: data.error } );
}

export async function  checkTwoFaCode(code: string): Promise<Result>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    try
    {
        const res = await fetch( "/api/user/2fa/check", 
        {
            method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (res.ok && data.token)
        {
            console.log("PAS DE SAUVEGARDE :" + data.status);
            localStorage.removeItem("token");
            localStorage.setItem("token", data.token);
            return ({ ok: true, status: data.status, token: data.token});
        }
        else if (res.ok)
        {
            return ({ ok: true, status: data.status });
        }
        return ({ ok: false, error: data.error });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}

export async function  desactivateTwoFa(): Promise<Result>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    const res = await fetch('/api/user/2fa/desactivate', 
    {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok)
    {
        return ({ ok: true, status: data.status });
    }
    return ( { ok: false, error: data.error } );
}