
type FriendsSuccess = {ok: true, friends?: AllFriends[] }
type Failure = { ok: false; error: string };

export type AllFriends = 
{
    username: string;
    slug: string;
    avatar: string;
};


export type FriendsResult = FriendsSuccess | Failure;

export async function   addFriend(slug: string): Promise<FriendsResult>
{
    const res = await fetch('/api/user/menu/friendslist', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json(); 
    return { ok: false, error: data.message};
}

export async function   removeFriend(slug: string): Promise<FriendsResult>
{
    console.log("FRONT remove friend");
    const res = await fetch('/api/user/menu/friendslist', 
    {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.message};
}

export async function   getAllFriends(): Promise<FriendsResult>
{
    const res = await fetch('/api/user/menu/friendslist/', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true,  friends: data.friends};
    }
    return { ok: false, error: data.message};
}

export async function   getAllFriendsBySlug(slug: string): Promise<FriendsResult>
{
    const res = await fetch(`/api/user/menu/friendslist/${slug}`, 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true,  friends: data.friends};
    }
    return { ok: false, error: data.message};
}

