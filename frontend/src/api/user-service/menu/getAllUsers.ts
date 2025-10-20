type Success = {ok: true, users: AllUsers[]}
type Failure = { ok: false; error: string };

export type AllUsers =
{
    username: string;
    slug: string;
};

export type UsersResult = Success | Failure;

export async function   getAllUsers(): Promise<UsersResult>
{
    const res = await fetch('/api/user/menu/users', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok) 
    {
        return { ok: true, users: data.users};
    }
    return { ok: false, error: data.message};
}