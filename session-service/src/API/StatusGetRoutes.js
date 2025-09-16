// Gives the status of a user : online, playing, disconnected
// Security : Road is protected to logged-in users
export async function getStatusForSlug(request, reply) {
	console.log('➡️ User accessed GET /:slug');
	
	const { slug } = request.params;
	if (!slug) {
		return reply.status(400).send({error: 'No slug found in request.'});
	}

	const { WebSocketManager } = request.server;
	if (!WebSocketManager) {
		console.error('❌ Error while getting sessions: connexion not found');
		return reply.status(500).send({ error: 'No sessions connection found.'});
	}

	const status = WebSocketManager.getUserStatusBySlug(slug);
	if (status === 'not found') {
		return reply.status(404).send({error: 'Requested user doesn\'t exist'});
	}
	return reply.status(200).send({ status: status, slug: slug });
}