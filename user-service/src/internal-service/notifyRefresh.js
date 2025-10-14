import env from "../../config/env.js";
import { getSecret } from "../index.js";
import prefix from "../tools/url.js";
import tlsAgent from "../tools/tlsAgent.js";

export async function notifyRefresh(idReceiver, sender, message) 
{
    const api_key = getSecret('api_key');

    const res = await fetch(`${prefix}://session-service:${env.session_port}/message`, 
    {
        method: 'POST',
        headers: 
        { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
        body: JSON.stringify({ userIds: [idReceiver], sender: sender, message: message }),
		dispatcher: tlsAgent
	});
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}