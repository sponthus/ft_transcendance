import GameMaster from '../../GameMaster.js';

// Sends a message to a user on his websocket, this user needs to be connected
// Security : Road is protected to logged-in users
// TODO = Allow use only from another service
export async function sendMessageToUser(request, reply) {
    console.log("➡️ User accessed POST /message/:userId");
	// const requestingUserId = request.user.idUser;
	// if (!requestingUserId)
	// 	return reply.status(401).send({ error: "Unauthorized"});
	
	const { userId } = request.params;
	
    const { sender, message } = request.body;
    if (!sender || !message) {
        return reply.status(400).send({
            error: 'Incomplete message : No sender or message found in request.' });
    }
    const gameMaster = GameMaster.getInstance();
    if (!gameMaster) {
		console.log("❌ Error while creating gameMaster object");
        return reply.status(500).send({
            error: 'Internal server error while fetching users' });
    }

    try {
        switch (gameMaster.sendMessageToUser(userId, sender, message)) {
            case 1 :
                return reply.status(202).send({
                    userId: userId,
                    sender: sender,
                    message: message,
                    status: 'accepted' });
            case 2 :
                return reply.status(404).send({
                    error: 'Cannot find user' });
            default:
                return reply.status(200).send({
                    userId: userId,
                    sender: sender,
                    message: message,
                    status: 'sent' });
        }
    } catch (error) {
        console.log("❌ Error while sending message to user: ", error.message);
		return reply.status(500).send({
			error: 'Internal server error while sending message'});
    }
}