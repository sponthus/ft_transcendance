import { BabylonAssetCache } from "../../../babylon/Cache/LoadAssetWithCache.js";
import { BabylonEngineCache } from "../../../babylon/Cache/LoadEngineWithCache.js";
import { BabylonSceneCache } from "../../../babylon/Cache/LoadSceneWithCache.js";
import { SessionSocket } from "../../../core/SessionSocket.js";

type Success = { ok: true };
type Failure = { ok: false; error: string };

export type LogoutResult = Success | Failure;

export async function logoutUser(): Promise<LogoutResult>
{
	const sessionSocket = SessionSocket.getInstance();
	sessionSocket.close(4010, "User logged out");

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
			BabylonAssetCache.clearCache();
			BabylonEngineCache._clearCache();
			BabylonSceneCache.clearCache();
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