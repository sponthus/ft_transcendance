import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

// Send a notification to all players when tournament has been canceled
export async function sendTournamentCancelation(senderId, playersIds, tournamentId, tournamentName) {
	if (!playersIds || !tournamentId || !tournamentName) {
		console.error("❌ Error while sending tournament cancelation notification: missing parameters");
		return { ok: false, error: "Error while sending tournament cancelation notification: missing parameters"};
	}
	console.log(`➡️ Sending notification for a tournament cancelation to ${playersIds} about tournament ${tournamentId} ${tournamentName}`);

	const api_key = getSecret('api_key');
	try {
		const res = await fetch(`${prefix}://user-service:${env.user_port}/notifications/tournament/post-notification`,
		{
			method: 'POST',
			headers: {
				'x-internal-api-key': api_key, 'Content-Type': 'application/json'
			},
			body : JSON.stringify({
				type: "tournament_cancel",
				receiverId: playersIds,
				senderId: senderId,
				tournamentId: tournamentId,
				tournamentName: tournamentName
			}),
			dispatcher: tlsAgent
		});
		if (res.ok)
			return { ok: true };
		const data = await res.json();
		return { ok: false, error: data.error, code: res.status };
	}
	catch (error) {
		console.error("❌ Error while sending tournament cancelation notice: ", error);
		return { ok: false, error: "Internal server error"};
	}
}