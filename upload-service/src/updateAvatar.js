import path from 'path'; // utilities for working with file and directory paths
import env from '../config/env.js';
import { getSecret } from "./index.js";
import prefix from "../tools/url.js";
import tlsAgent from "../tools/tlsAgent.js";

export async function   updateAvatar(avatar, idUser, slug)
{ 
	console.debug("💬 Update avatar to user-service");
    const api_key = getSecret('api_key');
    try
    {
        const res = await fetch(`${prefix}://user-service:${env.user_port}/user-info/avatar`, 
        {
            method: 'PATCH',
			headers: {
				'content-type': 'application/json',
                'x-internal-api-key': api_key
			},
            body: JSON.stringify({ avatar, idUser, slug }),
            dispatcher: tlsAgent

        });
        if (res.ok)
        {
            return ({ ok: true, status: res.status });
        }
        const data = await res.json();
        return ({ ok: false, error: data.message, status: res.status });
    }
    catch (err)
    { 
        return ({ ok: false, error: "Network error" });
    }
}

/*export async function notifyChangeData(idUser, username, slug, status="online") 
{
	console.debug("💬 Notify change data to session-service");
    const api_key = getSecret('api_key');
    try
    {
        const res = await fetch(`${prefix}://session-service:${env.session_port}/data/${idUser}`, 
        {
            method: 'PATCH',
            headers: 
            { 
                'Content-Type': 'application/json',
                'x-internal-api-key': api_key
            },
            body: JSON.stringify({ username: username, slug: slug, status: status }),
		    dispatcher: tlsAgent
	    });
        if (res.ok)
            return { ok: true };
        const data = await res.json();
		console.log("❌ Notify change didn't work : ", data);
        return { ok: false, message: data.error, status: res.status };
    }
    catch (err)
    {
		console.error("❌ Error notifying change data to session-service:", err);
        return { ok: false, message: err };
    }
}*/
