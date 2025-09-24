import { getSecret } from "../../index.js";
import env from "../../../config/env.js";

export async function updateUserStatus(userId, status) {
    if (!userId) {
		return { ok: false, error: "No userId given while updating user status"};
	}
	if (status != "playing" && status != "not_playing") {
		return { ok: false, error: "Unknown status given while updating user status"};
	}
	
	const api_key = getSecret('api_key');

    const res = await fetch(`http://session-service:${env.session_port}/status/${userId}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
        body: JSON.stringify({ status: status }),
    });
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}