import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

export async function updateUserStatus(userId, status) {
    if (!userId) {
		return { ok: false, error: "No userId given while updating user status"};
	}
	if (status != "playing" && status != "not_playing") {
		return { ok: false, error: "Unknown status given while updating user status"};
	}
	
	const api_key = getSecret('api_key');

    const res = await fetch(`${prefix}://session-service:${env.session_port}/status/${userId}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
        body: JSON.stringify({ status: status }),
		dispatcher: tlsAgent
    });
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}