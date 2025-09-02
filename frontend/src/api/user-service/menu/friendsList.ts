
type FriendsSuccess = {ok: true }
type Failure = { ok: false; error: string };

export type FriendsResult = FriendsSuccess | Failure;

//marche mais beaucoup de cas pas gérer (doublon par exemple), faire attention
export async function   addFriend(username: string): Promise<FriendsResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username }),
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true };
    }
    return { ok: false, error: data.error};
}

//marche pas 
/*export async function   getAllFriends(): Promise<FriendsResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist', 
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true,  };
    }
    return { ok: false, error: data.error};
}*/