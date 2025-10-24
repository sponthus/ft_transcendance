export async function   changeCharacterAsset (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   newAsset = request.body.asset;

    if (newAsset < 0 || newAsset > 18)
        return reply.code(400).send( { message: "Invalid character asset. Must between 0 and 18" } );
    try
    {
        const State = db.prepare (" SELECT \
                                        menu_asset_character \
                                    FROM \
                                        menu_state  \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        if (State.menu_asset === newAsset)
            return reply.code(409).send( { message: "Character asset is already at this value" } );
        const statement = db.prepare("  UPDATE \
                                            menu_state \
                                        SET \
                                            menu_asset_character = ? \
                                        WHERE \
                                            menu_user_id = ?");
        statement.run (newAsset, idUser);
        return reply.code(200).send({ asset: newAsset });
    }
    catch (err)
    {
        return reply.code(500).send ({ message: "Internal Server Error" + err.message });
    }
    
}

export async function   getCharacterAsset (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    
    try
    {
        const asset = db.prepare("  SELECT \
                                        menu_asset_character \
                                    FROM \
                                        menu_state \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        return reply.code(200).send({ ok: true, asset: asset.menu_asset_character });
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Server Error" });
    }
}
