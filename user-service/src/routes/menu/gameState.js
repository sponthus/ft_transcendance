export async function   changeGameState (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   newState = request.body.gameState;

    if (newState !== 0 && newState !== 1)
        return reply.code(400).send( { error: "Invalid Game State. Must be 0 or 1" } );
    try
    {
        const State = db.prepare("  SELECT \
                                        menu_game_state \
                                    FROM \
                                        menu_state  \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        if (State.menu_game_state === newState)
            return reply.code(400).send( { error : "Game State is already at this value" } );
        const statement = db.prepare("  UPDATE \
                                            menu_state \
                                        SET \
                                            menu_game_state = ? \
                                        WHERE \
                                            menu_user_id = ?");
        statement.run (newState, idUser);
        return reply.code(200).send({ gameState: newState });
    }
    catch (err)
    {
        return reply.code(500).send ({ error: "Internal Server Error" });
    }
    
}

export async function   getGameState (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    let     gameState;
    
    try
    {
        gameState = db.prepare("    SELECT \
                                        menu_game_state \
                                    FROM \
                                        menu_state \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        return reply.code(200).send({ ok:true, gameState: gameState });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" + err.message});
    }
}

/*
Une transaction est un bloc de plusieurs opérations SQL qui doivent être atomiques, c’est-à-dire :

Tout réussit → les changements sont validés (COMMIT).

Une seule échoue → tout est annulé (ROLLBACK).

Quand utiliser une transaction ?

Plusieurs modifications liées entre elles
Exemple : tu transfères de l’argent d’un compte A à un compte B.

UPDATE accounts SET balance = balance - 100 WHERE id = A

UPDATE accounts SET balance = balance + 100 WHERE id = B

Si la deuxième échoue, tu veux annuler la première pour ne pas perdre d’argent.

Insertions multiples qui doivent rester cohérentes

Tu crées un ordre et ses lignes de produits dans des tables séparées.

Si une insertion échoue, tu ne veux pas que la table principale soit mise à jour seule.

Préserver l’intégrité dans des environnements concurrents

Plusieurs utilisateurs modifient la même donnée en même temps.

La transaction garantit que tu n’as pas d’état “intermédiaire” incohérent.*/



