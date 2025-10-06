import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

export async function getUserIdFromSlug(slug) {
	console.log("Requesting userId from slug, ", slug);
	if (!slug) {
		return { ok: false, error: "No userId given while updating user status"};
	}

	const api_key = getSecret('api_key');

    const res = await fetch(`${prefix}://user-service:${env.user_port}/internal-service/${slug}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
		dispatcher: tlsAgent
    });
	const data = await res.json();  
    if (res.ok) {
        return { ok: true, userId: String(data.idUser.id) };
    } 
    return { ok: false, error: data.error };
}