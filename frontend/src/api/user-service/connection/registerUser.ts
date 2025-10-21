import { couldStartTrivia } from "typescript";
import { ErrorPopup } from "../../../pages/ErrorPage";

type AuthSuccess = { ok: true };
type Failure = { ok: false; error: string };

export type RegisterResult = AuthSuccess | Failure;

export async function registerUser(username: string, password: string): Promise<RegisterResult>
{
    try 
    {
        const res = await fetch('/api/user/register',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (res.ok)
        {
            return { ok: true };
        }
        const data = await res.json();
        await ErrorPopup("Error : " + data.message);
        return { ok: false, error: data.message };
    }
    catch (err)
    {
        return {ok: false, error: "Network error"};
    }
}