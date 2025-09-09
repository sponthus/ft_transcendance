import GameMaster from "../../GameMaster.js"

// Gives the status of a user : online, playing, disconnected
// Security : Road is protected to logged-in users
export async function getStatusForUserId(request, reply) {
	console.log('➡️ User accessed GET /:userId/status');
	
	const { userId } = request.params;
    if (!userId) {
        return reply.status(400).send({error: 'No userId found in request.'});
    }

    const gameMaster = GameMaster.getInstance();
    if (!gameMaster) {
		console.log("❌ Error fetching users : ")
		console.log(error);
        return reply.status(500).send({error: 'Internal server error while fetching users'});
    }
    const status = gameMaster.getUserStatus(userId);
    if (status === 'not found') {
        return reply.status(404).send({error: 'No user found in the server : user never logged-in or doesn\'t exist'});
    }
    return reply.status(200).send({ userId: userId, status: status });
}