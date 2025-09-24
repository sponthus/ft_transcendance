
// TODO = Check input VS SQL attacks, check nm ob players
export async function createTournament(request, reply) {
    console.log('➡️ User accessed POST /tournament');
    
    const { name, players } = request.body;
    if (!players || !name) {
        console.log("Lack of given data");
        return reply.status(400).send({error: 'Wrong input format, expected : userId, players.'});
    }

    const { db } = request.server;
    if (!db) {
		console.error('❌ Error while deleting game: database connection not found');
		return reply.status(500).send({ error: 'No database connection found.'});
	}
    
    const requestingUserId = request.user.idUser;
	if (!requestingUserId)
		return reply.status(401).send({ error: "Unauthorized."});

    console.log('userId = ' + requestingUserId + ' / name ' + name + ' / players ' + players);
    
    try {
        const result = await db.createTournament(name, requestingUserId, players);
        return reply.status(201).send(result);
    }
    catch (error) {
		console.log('❌ Error creating tournament : ');
		console.log(error);
        return reply.status(500).send({ error: 'Internal server error while creating tournament.'});
    }
}