export default async function logoutUser(request, reply)
{
    try
    {
        return reply.code(200).clearCookie('token',
        {
            httpOnly: true,
            signed: true,
            secure: false,
            path: '/',
            maxAge: 3600000
            // TODO mettre same site
        }).send();
    }
    catch (err)
    {
        return reply.code(500).send({ message: "Internal Servor Error" });
    }
}