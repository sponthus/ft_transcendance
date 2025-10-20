import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

export async function getUserIdFromSlug(slug) {
	console.log("➡️ Requesting userId from slug: ", slug);
	if (!slug) {
		return { ok: false, error: "No userId given while updating user status"};
	}

	const api_key = getSecret('api_key');

    try {
		const res = await fetch(`${prefix}://user-service:${env.user_port}/internal-service/${slug}`, {
			method: 'GET',
			headers: {
				'x-internal-api-key': api_key
			},
			dispatcher: tlsAgent
		});
		const data = await res.json();  
		if (res.ok && data && data.idUser != undefined) {
			// console.debug("Found userId ", data.idUser);
			return { ok: true, userId: String(data.idUser.id) };
		} else {
			return { ok: false, error: "User not found" };
		}
	} catch (error) {
		console.error("❌ Error while requesting userId from slug: ", error);
		return { ok: false, error: "Internal error while requesting userId from slug"};
	}
}