// Gives the status of a user : online, playing, disconnected
// Security : Road is protected to logged-in users
export async function getStatusForUserId(request, reply) {
	console.log('➡️ User accessed GET /:userId/status for ' + userId);
	
    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
			return reply.status(401).send({ error: "Unauthorized"});
	
	const { userId } = request.params;
    if (!userId) {
        return reply.status(400).send({error: 'No userId found in request.'});
    }

    const gameMaster = GameMaster.getInstance();
    if (!gameMaster) {
		console.log("❌ Error fetching users : ", error);
        return reply.status(500).send({error: 'Internal server error while fetching users'});
    }
    const status = gameMaster.getUserStatus(userId);
    if (status === 'not found') {
        return reply.status(404).send({error: 'No user found in the server.'});
    }
    return reply.status(200).send({ userId: userId, status: status });
}