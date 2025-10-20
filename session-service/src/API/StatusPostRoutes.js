import { checkIdFormat, checkNumberIdFormat } from '../tools/CheckFormat.js';

// Sends a message to a user on his websocket, this user needs to be connected
// Security : Road is protected to service-only, and from SQLi
export async function sendMessageToUsers(request, reply) {
	console.log("➡️ Service accessed POST /message");
	console.debug('request.body :', request.body);
	console.debug('request.body type :', typeof request.body);

	const { userIds, sender, message } = request.body;
	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.log("❌ Error while getting sessions: connexion not found");
		return reply.status(500).send({
			error: 'Internal server error' });
	}

	let notFoundCount = 0;
	let successCount = 0;
	let failedCount = 0;
	try {
		for (const userId of userIds) {
			switch (WebSocketManager.sendMessageToUser(userId, sender, message)) {
				case 0 :
					successCount++;
					break;
				case 1 :
					successCount++;
					break;
				case 2 :
					notFoundCount++;
					break;
				case 3 :
					failedCount++;
					break;
				default:
					failedCount++;
					break;
			}
		}
	} catch (error) {
		console.log("❌ Error while sending message to user: ")
		console.log(error);
		return reply.status(500).send({
			error: 'Internal server error'});
	}
	if (successCount === userIds.length) {
		return reply.status(200).send({
			sent: successCount,
			failed: failedCount,
			not_found: notFoundCount,
			status: 'all_sent' });
	} else if (successCount > 0) {
		return reply.status(207).send({
			sent: successCount,
			failed: failedCount,
			not_found: notFoundCount,
			status: 'partial_success' });
	} else {
		if (notFoundCount === userIds.length) {
			return reply.status(404).send({
				sent: successCount,
				failed: failedCount,
				not_found: notFoundCount,
				status: 'no_user_found' });
		} else if (failedCount === userIds.length) {
			return reply.status(500).send({
				sent: successCount,
				failed: failedCount,
				not_found: notFoundCount,
				status: 'all_failed' });
		}
	}
}