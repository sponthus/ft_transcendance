import { ErrorPopup } from "../../../pages/ErrorPage";

type Result =
    | { ok: true }
    | { ok: false; error?: string} //? --> pas forcement la variable
  //  | { ok: true; user: { username: string; slug: string; id: number } }

export async function checkLog(): Promise<Result>
{
    console.log("Checking log...");
    const token = localStorage.getItem("token");
    if (!token)
        return ({ ok: false });
    const res = await fetch('/api/user/protected',
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    });
    const data = await res.json();
    console.log('res dans checklog', res);
    if (res.ok)
    {
        console.log("Log check successful"); // Debug
        return { ok: true }//, user: { username: data.username, slug: data.slug } };
    }
    localStorage.removeItem("token"); //remove si le token est pas présent ?
    console.log("Log check failure");
    console.log('status = ', res.status);
    if (res.status === 401)
    {
        ErrorPopup(data.error);
        return { ok: false, error: data.error};
    }
    return { ok: false };
}