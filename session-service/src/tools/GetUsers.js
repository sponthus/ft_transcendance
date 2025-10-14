import { getSecret } from "../index.js";
import env from "../../config/env.js";
import tlsAgent from "./tlsAgent.js";
import url from "./url.js";

export async function	getAllUsers() {
	console.log("GET request sent to get infos on existing users");
	const api_key = getSecret('api_key');
	if (!api_key) {
		return ({ ok: false, error: "❌ Critical access to api_key error" });
	}

	try {
		const res = await fetch(`${url}://user-service:${env.user_port}/internal-service/users-info`, {
			method: 'GET',
			headers: { 
				'Content-Type': 'application/json',
				'x-internal-api-key': api_key
			},
			dispatcher: tlsAgent
		});
		if (res.ok) {
			const data = await res.json();
			return { ok: true, data: data.users };
		}
	} catch (error) {
		const data = await res.json();
		return { ok: false, error: data.error };
	}
	return { ok: false, error: data.error };
}

export async function checkHealth() {
	const api_key = getSecret('api_key');
	if (!api_key) {
		return ({ ok: false, error: "❌ Critical access to api_key error" });
	}
	try {
		const res = await fetch(`${url}://user-service:${env.user_port}/health`, {
			method: 'GET',
			headers: {
				'x-internal-api-key': api_key
			},
			dispatcher: tlsAgent
		});
		if (res.ok) {
			const data = await res.json();
			// console.debug(data); // To show the found data
			return { ok: true, data: data.users };
		}
		const data = await res.json();    
		return { ok: false, error: data.error };
	} catch (error) {
		return { ok: false, error: error.message };
	}
}