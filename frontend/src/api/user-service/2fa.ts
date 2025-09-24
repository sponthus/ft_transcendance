type Success = {ok: true, qrCode?: string }
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

export const validateTwoFa = (code: string) => checkTwoFaCode('/api/user/2fa/validate', code); //Pour valide l'activation de la 2FA
export const verifyTwoFa = (code: string) => checkTwoFaCode('/api/user/2fa/verify', code); // pour login avec 2FA

export async function  checkTwoFaCode(url:string, code: string): Promise<Result>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    try
    {
        const res = await fetch( url, 
        {
            method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, qrCode: data.msg });
        }
        return ({ ok: false, error: data.error });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}