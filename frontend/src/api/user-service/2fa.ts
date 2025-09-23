type Success = {ok: true, qrCode: string }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({})   
    });
    const data = await res.json();
    if (res.ok)
    {
        return ( { ok: true, qrCode: data.qrCode } );
    }
    return ( { ok: false, error: data.error } );
}