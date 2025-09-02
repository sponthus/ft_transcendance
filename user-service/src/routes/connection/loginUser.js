import bcrypt from "bcrypt";

export default async function loginUser (request, reply)
{
    console.log("\nREQUEST :\n");
    console.log("URL : " + request.url + "\n");
    console.log("username : " + request.body.username + "\n");
    console.log("password : " + request.body.password + "\n");

    const db = request.server.db;
    const { username, password } = request.body;

    if (!username || !password)
        return (reply.code(400).send({error : "Username and password are required"}));
    try 
    {
        const userData = db.prepare("   SELECT \
                                            * \
                                        FROM \
                                            users \
                                        WHERE \
                                            username = ?").get(username);
        if (!userData)
            return (reply.code(401).send({error : "Username or password invalid"}));
         if ((bcrypt.compareSync(password, userData.pw_hash) == false))
            return(reply.code(401).send({error : "Username or password invalid"})); //message generique pour les attaques
        const idUser = userData.id;
        const slug = userData.slug;
        const token = await reply.jwtSign({ idUser, username, slug }, {expiresIn: '1h'});
        return reply.code(200).send({ token: token, username: userData.username, slug: userData.slug, id: userData.id });
    }
    catch (err)
    {
        return (reply.code(500).send( {error : "Internal Server Error"} ));
    }
}