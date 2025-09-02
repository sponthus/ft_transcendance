import Ajv from "ajv"

export default async function   updateNickname (request, reply)
{
    if (checkFormat(request) == false)
        return reply.code(400).send( {error : "Invalid format nickname"} );

    const db = request.server.db;
    const newNickname = request.body.nickname;
    const idUser = request.user.idUser;      
    try
    {
        //faire un message comme quoi on a deja ce nickname si veut changer avec le meme 
        const existingNickname = db.prepare('   SELECT \
                                                    1 \
                                                FROM \
                                                    users \
                                                WHERE \
                                                    nickname = ?').get(newNickname);
        if (existingNickname)
             return reply.code(409).send({error: "Nickname already exist"});
        db.prepare ("   UPDATE \
                            users \
                        SET \
                            nickname = ? \
                        WHERE \
                            id = ?").run(newNickname, idUser);
        return reply.code(200).send( {nickname: newNickname} )
    }
    catch (err)
    {
        return reply.code(500).send( {error : "Internal Server Error"} );
    }
}

function    checkFormat(request)
{
    const schema = 
    {
        type: "object",
        properties:
        {
            nickname: { type: "string", minLength: 3, maxLength: 15, pattern: "^(?=.*[a-zA-Z]).+$"}, //autoriser chiffre et certain char speciaux
        },
        required: ["nickname"],
        additionalProperties: false //si autre chose dans properties que nickname --> refuse
    };
    const ajv = new Ajv(); //le mettre ailleurs pour eco du CPU ?
    const contract = ajv.compile(schema);
    const valid = contract(request.body);
    if (!valid)
        return (false);
    return (true);
}