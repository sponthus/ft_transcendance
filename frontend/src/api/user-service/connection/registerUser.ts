import { couldStartTrivia } from "typescript";
import { ErrorPopup } from "../../../pages/ErrorPage";

type AuthSuccess = { ok: true };
type Failure = { ok: false; error: string };

export type RegisterResult = AuthSuccess | Failure;

export async function registerUser(username: string, password: string): Promise<RegisterResult>
{
    console.log("JE PASSE DANS REGISTER USER");
    try 
    {
        const res = await fetch('/api/user/register',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        console.log('DATA :', data);
        if (res.ok)
        {
            alert('register worked');
        //    localStorage.setItem("token", data.token); //plus dans le local storage normalement
            return { ok: true };
        }
        alert('register failed');
        console.log('REGISTER USSSSSSSSSSSER');
        console.log('️⚡️⚡️⚡️⚡️⚡ Error : ', data.message);
        await ErrorPopup("Error : " + data.message); //enlever await ErrorPopup ?
        return { ok: false, error: data.message };
    }
    catch (err)
    {
        return {ok: false, error: "Network error"};
    }
}