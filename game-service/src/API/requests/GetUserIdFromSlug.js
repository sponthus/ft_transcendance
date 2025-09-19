import { getSecret } from "../../index.js";
import env from "../../../config/env.js";

export async function getUserIdFromSlug(slug) {
	console.log("Requesting userId from slug, ", slug);
	if (!slug) {
		return { ok: false, error: "No userId given while updating user status"};
	}

	const api_key = getSecret('api_key');

    const res = await fetch(`http://user-service:${env.user_port}/internal-service/${slug}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        }
    });
	const data = await res.json();  
    if (res.ok) {
		console.log("got : ", data.idUser.id);
        return { ok: true, userId: data.idUser.id };
    } 
    return { ok: false, error: data.error };
}