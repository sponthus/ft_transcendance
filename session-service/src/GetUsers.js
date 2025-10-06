import { getSecret } from "./index.js";
import env from "../config/env.js";

export async function	getAllUsers() {
	console.log("GET request sent to get infos on existing users");
	const api_key = getSecret('api_key');
	if (!api_key) {
		return ({ ok: false, error: "❌ Critical access to api_key error" });
	}

	const res = await fetch(`http://user-service:${env.user_port}/internal-service/users-info`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        }
    });
    if (res.ok) {
		const data = await res.json();
		// console.debug(data); // To show the found data
        return { ok: true, data: data.users };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}