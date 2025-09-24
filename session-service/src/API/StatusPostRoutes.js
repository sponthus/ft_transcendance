import { checkIdFormat, checkSendMessageFormat } from '../CheckFormat.js';

// Sends a message to a user on his websocket, this user needs to be connected
// Security : Road is protected to service-only, and from SQLi
export async function sendMessageToUser(request, reply) {
	console.log("➡️ Service accessed POST /message/:userId");
	
	const { userId } = request.params;
	if (!userId) {
		console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌ No userId found in request params');
		return reply.status(400).send({error: 'No userId found in request.'});
	}
	if (checkIdFormat(userId) === false) {
		console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌ Bad userId found in request params');
		return reply.status(400).send({ error: 'Bad userId format.'});
	}
	if (checkSendMessageFormat(request) === false) {
		console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌ Bad data format sent in request body');
		return reply.status(400).send({ error: 'Bad data format - expected : sender, message.'});
	}
	const { sender, message } = request.body;

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.log("❌ Error while getting sessions: connexion not found");
		return reply.status(500).send({
			error: 'No sessions connexion found' });
	}

	try {
		switch (WebSocketManager.sendMessageToUser(userId, sender, message)) {
			case 1 :
				return reply.status(202).send({
					userId: userId,
					sender: sender,
					message: message,
					status: 'accepted' });
			case 2 :
				return reply.status(404).send({
					error: 'Cannot find user' });
			case 3 :
				throw new Error("Unable to send message");
			default:
				return reply.status(200).send({
					userId: userId,
					sender: sender,
					message: message,
					status: 'sent' });
		}
	} catch (error) {
		console.log("❌ Error while sending message to user: ")
		console.log(error);
		return reply.status(500).send({
			error: 'Internal server error while sending message'});
	}
}