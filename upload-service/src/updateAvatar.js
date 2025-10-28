import path from 'path'; // utilities for working with file and directory paths
import env from '../config/env.js';
import { getSecret } from "./index.js";
import prefix from "../tools/url.js";
import tlsAgent from "../tools/tlsAgent.js";

export async function   updateAvatar(avatar, idUser, slug)
{ 
	console.log("💬 Update avatar to user-service");
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

