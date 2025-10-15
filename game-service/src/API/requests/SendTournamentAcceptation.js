import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

// TODO tests
// TODO Elodie : change URL when ready
export async function sendTournamentAcceptation(inviterId, inviteeId, tournamentId, tournamentName) {
	if (!inviteeId || !inviterId || !tournamentId || !tournamentName) {
		console.error("❌ Error while sending tournament acceptation notification: missing parameters");
		return { ok: false, error: "Error while sending tournament acceptation notification: missing parameters"};
	}
	console.log(`➡️ Sending notification for a tournament acceptation to ${inviterId} from ${inviteeId} about tournament ${tournamentId}`);

	const api_key = getSecret('api_key');
	try {
		const res = await fetch(`${prefix}://user-service:${env.user_port}/notifications/tournament/post-notification`,
		{
			method: 'POST',
			headers: {
				'x-internal-api-key': api_key, 'Content-Type': 'application/json'
			},
			body : JSON.stringify({
				type: "tournament_accept",
				receiverId: inviterId,
				senderId: inviteeId,
				tournamentId: tournamentId,
				tournamentName: tournamentName
			}),
			dispatcher: tlsAgent
		});
		if (res.ok)
			return { ok: true };
		const data = await res.json();
		return { ok: false, error: data.error };
	} catch (error) {
		console.error("❌ Error while sending tournament ready notice: ", error);
		return { ok: false, error: "Internal error while sending tournament ready notice"};
	}
}