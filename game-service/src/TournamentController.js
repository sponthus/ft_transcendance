export async function createTournament(request, reply) {
    const { name, userId,  players } = request.body;
    const { db } = request.server;

    console.log('User accessed POST /tournament');
    if (!userId || !players || !name) {
        console.log("Lack of given data");
        return reply.status(400).send({error: 'Invalid input, expected : userId, players'});
    }
    console.log('userId = ' + userId + ' / name ' + name + ' / players ' + players);
    if (!db) {
        return reply.status(400).send({error: 'No database connection found.'});
    }
    try {
        const result = await db.createTournament(name, userId, players);
        return reply.status(201).send(result);
    }
    catch (error) {
        return reply.status(400).send({ error: "Game creation failed " + error.message });
    }
}