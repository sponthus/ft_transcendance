export async function   changeNpcAsset (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   newAsset = request.body.asset;

    if (newAsset < 0 || newAsset > 11)
        return reply.code(400).send( { error: "Invalid NPC asset. Must between 0 and 11" } );
    try
    {
        const State = db.prepare (" SELECT \
                                        menu_asset_npc \
                                    FROM \
                                        menu_state  \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        if (State.menu_asset === newAsset)
            return reply.code(400).send( { error : "NPC asset is already at this value" } );
        const statement = db.prepare("  UPDATE \
                                            menu_state \
                                        SET \
                                            menu_asset_npc = ? \
                                        WHERE \
                                            menu_user_id = ?");
        statement.run (newAsset, idUser);
        return reply.code(200).send({ asset: newAsset });
    }
    catch (err)
    {
        return reply.code(500).send ({ error: "Internal Server Error" });
    }
    
}

export async function   getNpcAsset (request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    
    try
    {
        const asset = db.prepare("  SELECT \
                                        menu_asset_npc \
                                    FROM \
                                        menu_state \
                                    WHERE \
                                        menu_user_id = ?").get(idUser);
        return reply.code(200).send({ ok:true, asset: asset });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" + err.message});
    }
}