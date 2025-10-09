import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

// TODO tests
// TODO Elodie : change URL when ready
export async function sendTournamentReady(userIds, inviterId, tournamentId, tournamentName) {
	if (!userIds || !inviterId || !tournamentId || !tournamentName) {
		console.error("❌ Error while sending tournament ready notification: missing parameters");
		return { ok: false, error: "Error while sending tournament ready notification: missing parameters"};
	}
	console.log(`➡️ Sending notification for a tournament ready to ${userIds} from ${inviterId} about tournament ${tournamentId}`);

	const api_key = getSecret('api_key');
	try {
		// const res = await fetch(`${prefix}://user-service:${env.user_port}/internal-service/post-tournament-notification/${userId}`, // TODO change URL
		// {
		// 	method: 'POST',
		// 	headers: {
		// 		'x-internal-api-key': api_key
		// 	},
		// 	body : JSON.stringify({
				// type: "ready",
				// inviterId: inviterId,
				// inviteeId: userIds,
				// tournamentId: tournamentId,
				// tournamentName: tournamentName
		// 	}),
		// 	dispatcher: tlsAgent
		// });
		// const data = await res.json();
		// if (res.ok) {
			return { ok: true };
		// } 
		// return { ok: false, error: data.error };
	} catch (error) {
		console.error("❌ Error while sending tournament ready notice: ", error);
		return { ok: false, error: "Internal error while sending tournament ready notice"};
	}
}