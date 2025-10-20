import { ErrorPopup } from "../../../pages/ErrorPage";

type Result =
    | { ok: true }
    | { ok: false; error?: string} //? --> pas forcement la variable
  //  | { ok: true; user: { username: string; slug: string; id: number } }

export async function checkLog(): Promise<Result>
{
    console.log("Checking log...");
    const res = await fetch('/api/user/protected',
    {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    });
    if (res.ok)
    {
        console.log("Log check successful"); // Debug
        return { ok: true }//, user: { username: data.username, slug: data.slug } };
    }
    const data = await res.json();
    console.log("Log check failure");
    console.log('status = ', res.status);
    if (res.status === 401)
    {
        //await ErrorPopup(data.message);
        return { ok: false, error: data.message};
    }
    return { ok: false };
}