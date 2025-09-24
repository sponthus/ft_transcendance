// Updates the infos of a user (in case of a change of username/slug)
// Expecting in the body: username, slug
// Security : Road is protected to service-only
export async function changeUserInfos(request, reply) {
	console.log('➡️ User accessed PATCH /data/:userId');
	
	const { userId } = request.params;
	if (!userId) {
		return reply.status(400).send({error: 'No userId found in request.'});
	}

	const { username, slug } = request.body;
	if (!username || !slug) {
		return reply.status(400).send({error: 'No data found in request.'});
	}

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	const data = WebSocketManager.updateUserInfos(userId, username, slug);
	if (data == null) {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	return reply.status(200).send({ userId: data.userId, username: data.username, slug: data.slug });
}


// Updates the status of a user (playing | online | disconnected)
// Expecting in the body: status
// Security : Road is protected to service-only
export async function changeUserStatus(request, reply) {
	console.log('➡️ User accessed PATCH /status/:userId');
	
	const { userId } = request.params;
	if (!userId) {
		return reply.status(400).send({error: 'No userId found in request.'});
	}

	let { status } = request.body;
	if (!status) {
		return reply.status(400).send({error: 'No status found in request.'});
	}
	if (status !== 'playing' && status !== 'not_playing') {
		return reply.status(400).send({error: 'Wrong status sent for update (playing | not_playing).'});
	}

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	const actualStatus = WebSocketManager.getUserStatusByUserId(userId);
	if (!actualStatus == "not found") {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	if (status == "not_playing") {
		if (actualStatus == "playing")
			status = "online";
		else if (actualStatus == "disconnected")
			return reply.status(200).send({ userId: userId, status: actualStatus });
		else if (actualStatus == "connected")
			return reply.status(200).send({ userId: userId, status: actualStatus });
	} else if (status == "playing") {
		if (actualStatus == "online")
			status = "playing";
		else if (actualStatus == "online")
			return reply.status(200).send({ userId: userId, status: actualStatus });
		else if (actualStatus == "disconnected")
			return reply.status(500).send({ error: 'Player is disconnected, he cannot play'});
	}
	const data = WebSocketManager.updateUserStatus(userId, status);
	if (data == null) {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	return reply.status(200).send({ userId: data.userId, status: data.status });
}