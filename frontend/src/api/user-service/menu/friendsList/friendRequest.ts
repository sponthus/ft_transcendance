
type FriendsSuccess = {ok: true, friends?: string[] }
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
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json(); // il est la car au dessus le JSON envoye est vide  
    return { ok: false, error: data.error};
}

export async function   removeFriend(username: string): Promise<FriendsResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    console.log("FRONT remove friend");
    const res = await fetch('/api/user/menu/friendslist', 
    {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error};
}

export async function   getAllFriends(): Promise<FriendsResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist/', 
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true,  friends: data};
    }
    return { ok: false, error: data.error};
}

