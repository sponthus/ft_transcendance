import { checkChangeInfosFormat, checkIdFormat, checkStatusFormat } from "../tools/CheckFormat.js";

// Updates the infos of a user (in case of a change of username/slug)
// Expecting in the body: username, slug
// Security : Road is protected to service-only and from SQLi
export async function changeUserInfos(request, reply) {
	console.log('➡️ User accessed PATCH /data/:userId');
	
	const { userId } = request.params;
	if (!userId) {
		console.error('❌ No userId found in request params');
		return reply.status(400).send({error: 'No userId found in request.'});
	}
	if (checkIdFormat(userId) === false) {
		console.error('❌ Bad userId found in request params');
		return reply.status(400).send({ error: 'Bad userId format.'});
	}
	if (checkChangeInfosFormat(request) === false) {
		console.error('❌ Bad data format sent in request body');
		return reply.status(400).send({ error: 'Bad data format - expected : username, slug.'});
	}
	const { username, slug } = request.body;

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'Internal server error while fetching users'});
	}

	const data = WebSocketManager.updateUserInfos(Number(userId), username, slug);
	if (data == null) {
		console.log(`User with ${userId} not found.`);
		return reply.status(404).send({error: 'Requested user not found.'});
	}
	return reply.status(200).send({ userId: data.userId, username: data.username, slug: data.slug });
}


// Updates the status of a user (playing | online | disconnected)
// Expecting in the body: status
// Security : Road is protected to service-only and from SQLi
export async function changeUserStatus(request, reply) {
	console.log('➡️ User accessed PATCH /status/:userId');
	
	const { userId } = request.params;
	if (!userId) {
		console.error('❌ No userId found in request params');
		return reply.status(400).send({error: 'No userId found in request.'});
	}
	if (checkIdFormat(userId) === false) {
		console.error('❌ Bad userId format sent in request params');
		return reply.status(400).send({ error: 'Bad userId format.'});
	}

	let { status } = request.body;
	if (!status) {
		console.error('❌ No status found in request body');
		return reply.status(400).send({error: 'No status found in request.'});
	}
	if (checkStatusFormat(status) === false) {
		console.error('❌ Wrong status format sent in request body');
		return reply.status(400).send({error: 'Wrong status sent for update (playing | not_playing).'});
	}

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'Internal server error while fetching users'});
	}

	const actualStatus = WebSocketManager.getUserStatusByUserId(userId);
	if (!actualStatus == "not found") {
		return reply.status(404).send({error: 'Requested user not found.'});
	}
	if (status == "not_playing") {
		if (actualStatus == "playing")
			status = "online";
		else if (actualStatus == "disconnected")
			return reply.status(200).send({ userId: userId, status: actualStatus });
		else if (actualStatus == "online")
			return reply.status(200).send({ userId: userId, status: actualStatus });
	} else if (status == "playing") {
		if (actualStatus == "online")
			status = "playing";
		else if (actualStatus == "disconnected") {
			console.error('❌ User is disconnected, he cannot be playing.');
			return reply.status(500).send({ error: 'Player is disconnected, he cannot play'});
		}
	}
	const data = WebSocketManager.updateUserStatus(userId, status);
	if (data == null) {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	return reply.status(200).send({ userId: data.userId, status: data.status });
}