import { SessionSocket } from "../../../core/SessionSocket.js";

type Success = { ok: true };
type Failure = { ok: false; error: string };

export type LogoutResult = Success | Failure;

export async function logoutUser(): Promise<LogoutResult>
{
	const sessionSocket = SessionSocket.getInstance();
	sessionSocket.close(4000, "User logged out");

    try
    {
        const res = await fetch('/api/user/logout',
        {
            method: 'PUT',
			headers: {
				'content-type': 'application/json',
				'host': window.location.host
			},
			body: JSON.stringify({ action: 'logout' }),
            credentials: 'include'  
        });
        if (res.ok) 
        {
            return { ok: true };
        }
        const data = await res.json();
        return { ok: false, error: data.message };
    }
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}