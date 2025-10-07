import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

// TODO = Check me
export async function getUserInfoFromId(userId) {
	console.log("➡️ Requesting user infos from userId, ", userId);
	if (!userId) {
		return { ok: false, error: "No userId given while updating user status"};
	}

	const api_key = getSecret('api_key');

	try {
		const res = await fetch(`${prefix}://user-service:${env.user_port}/internal-service/infos/${userId}`, {
			method: 'GET',
			headers: {
				'x-internal-api-key': api_key
			},
			dispatcher: tlsAgent
		});
		const data = await res.json();
		console.debug("Got response : ");
		console.debug(data.userInfo);
		if (res.ok) {
			return { ok: true, infos: data.userInfo};
		} 
		return { ok: false, error: data.error };
	} catch (error) {
		console.error("❌ Error while requesting user infos from userId: ", error);
		return { ok: false, error: "Internal error while requesting user infos from userId"};
	}
}