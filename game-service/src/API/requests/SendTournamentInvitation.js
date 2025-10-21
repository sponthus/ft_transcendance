import { getSecret } from "../../index.js";
import env from "../../../config/env.js";
import prefix from "../../tools/url.js";
import tlsAgent from "../../tools/tlsAgent.js";

// Send an invitation to a user to join a tournament
export async function sendTournamentInvitation(userId, inviterId, tournamentId, tournamentName) {
	if (!userId || !inviterId || !tournamentId || !tournamentName) {
		console.error("❌ Error while sending tournament invitation: missing parameters");
		return { ok: false, error: "Error while sending tournament invitation: missing parameters"};
	}
	console.log(`➡️ Sending notification for a tournament invitation to ${userId} from ${inviterId} about tournament ${tournamentId}`);

	const api_key = getSecret('api_key');
	try {
		const res = await fetch(`${prefix}://user-service:${env.user_port}/notifications/tournament/post-notification`,
		{
			method: 'POST',
			headers: {
				'x-internal-api-key': api_key, 'Content-Type': 'application/json'
			},
			body : JSON.stringify({
				type: "tournament_invite",
				receiverId: userId,
				senderId: inviterId,
				tournamentId: tournamentId,
				tournamentName: tournamentName
			}),
			dispatcher: tlsAgent
		});
		if (res.ok)
		{
			console.log('invitation envoye');
			return { ok: true };
		}
		const data = await res.json();
		console.error("❌ Error while sending tournament invitation: ", data.message); //il est la car au dessus c'est vide :) juste le ok
		return { ok: false, error: data.message };
	} catch (error) {
		console.error("❌ Error while sending tournament invitation: ", error);
		return { ok: false, error: "Internal error while sending tournament invitation"};
	}
}