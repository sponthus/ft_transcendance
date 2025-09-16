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


// Updates the infos of a user (in case of a change of username/slug)
// Expecting in the body: username, slug
// Security : Road is protected to service-only
export async function changeUserStatus(request, reply) {
	console.log('➡️ User accessed PATCH /status/:userId');
	
	const { userId } = request.params;
	if (!userId) {
		return reply.status(400).send({error: 'No userId found in request.'});
	}

	const { status } = request.body;
	if (!status) {
		return reply.status(400).send({error: 'No status found in request.'});
	}
	if (status !== 'playing' && status !== 'disconnected' && status !== 'online') {
		return reply.status(400).send({error: 'Wrong status (playing | online | disconnected).'});
	}

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}

	const data = WebSocketManager.updateUserStatus(userId, status);
	if (data == null) {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	return reply.status(200).send({ userId: data.userId, status: data.status });
}