import { getSecret } from "../index.js";
import env from "../../config/env.js";

export async function notifyRefresh(idReceiver, sender, message) 
{
    const api_key = getSecret('api_key');

    const res = await fetch(`http://session-service:${env.session_port}/message/${idReceiver}`, 
    {
        method: 'POST',
        headers: 
        { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
        body: JSON.stringify({ sender: sender, message: message }),
    });
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}
