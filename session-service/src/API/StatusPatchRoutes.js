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
	const { username, slug, status } = request.body;

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'Internal server error while fetching users'});
	}

	try {
		const data = WebSocketManager.updateUserInfos(Number(userId), username, slug, status);
		console.log('✅ User infos updated successfully');
		return reply.status(200).send({ userId: data.userId, username: data.username, slug: data.slug });
	} catch (err) {
		console.error('❌ Error while updating user infos:', err.message);
		return reply.status(500).send({ error: 'Internal server error.'});
	}
}
