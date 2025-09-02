type Result =
    | { ok: true }
    | { ok: false; error?: string} //? --> pas forcement la variable
  //  | { ok: true; user: { username: string; slug: string; id: number } }

// GET /me request using the token found in memory, and updates the local infos for user
// -> Returns ok: true | false, and if ok, user: { username: string; slug: string }
// TODO = Not functional !

//OBSOLETE
/*const userInfo = localStorage.getItem("user-info"); // enlever remettre token
    if (!userInfo)
    {
        console.log("No user info - disconnected");
        return { ok: false};

    }
    return ({ ok: true }); // A ENLEVER TEMPORAIRE POUR VOIR
    */


export async function checkLog(): Promise<Result>
{
    console.log("Checking log...");
    const token = localStorage.getItem("token");
    /*if (!token)
    {
        console.log("No token - disconnected");
        return ({ok: false});
    }*/
    const res = await fetch('/api/user/protected',
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    });
    const data = await res.json();
    console.log('res dans checklog', res);
    if (res.ok)
    {
        //state.login(data.username, data.slug); // Restore user in local state
        console.log("Log check successful"); // Debug
        return { ok: true }//, user: { username: data.username, slug: data.slug } };
    }
    // Invalid or expired token = Disconnect
    localStorage.removeItem("token");
    localStorage.removeItem("user-info");
    console.log("Log check failure");
        // if (res.status === 401) // TODO = Is it useful ?
    return { ok: false, error: data.error};
}