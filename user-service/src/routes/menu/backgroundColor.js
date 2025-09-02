export async function   changeBackgroundColor(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;
    const   {red, green, blue} = request.body;

    if ((red < 0 || red > 255) || (green < 0 || green > 255) || (blue < 0 || blue > 255))
        return reply.code(400).send({ error: "Invalid RGB value. Each component must be between 0 and 255." });
    try
    {
        const rgbColor = db.prepare("   SELECT \
                                            menu_color_r, menu_color_g, menu_color_b \
                                        FROM \
                                            menu_state \
                                        WHERE \
                                            menu_user_id = ?").get(idUser);
        if (rgbColor.menu_color_r === red && rgbColor.menu_color_g === green && rgbColor.menu_color_b === blue)
            return reply.code(400).send( {error : "Rgb color already set to this value"} );
        db.prepare("    UPDATE \
                            menu_state \
                        SET \
                            menu_color_r = ?, menu_color_g = ?, menu_color_b = ? \
                        WHERE \
                            menu_user_id = ?").run(red, green, blue, idUser);
        return reply.code(200).send({ rgbColor: { red, green, blue } });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}

export async function   getBackgroundColor(request, reply)
{
    const   db = request.server.db;
    const   idUser = request.user.idUser;

    try
    {
        const rgbColor = db.prepare("   SELECT \
                                            menu_color_r, menu_color_g, menu_color_b \
                                        FROM \
                                            menu_state \
                                        WHERE \
                                            menu_user_id = ?").get(idUser);
        return reply.code(200).send({ rgbColor: rgbColor });
    }
    catch (err)
    {
        return reply.code(500).send({ error: "Internal Server Error" });
    }
}