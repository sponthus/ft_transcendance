import { ErrorPopup } from "../../../pages/ErrorPage";

type Result =
    | { ok: true }
    | { ok: false; error?: string}

export async function checkLog(): Promise<Result>
{
    try
    {
        console.log("Checking log...");
        const res = await fetch('/api/user/protected',
        {
            method: 'GET',
    		headers: {
    			'host': window.location.host
    		},
            credentials: 'include',
            cache: 'no-store'
        });
        if (res.ok)
        {
            console.log("Log check successful"); 
            return { ok: true }
        }
        const data = await res.json();
        //console.log("Log check failure");
        //console.log('status = ', res.status);
        if (res.status === 401)
        {
            return { ok: false, error: data.message};
        }
        return { ok: false }; 
    }
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}
