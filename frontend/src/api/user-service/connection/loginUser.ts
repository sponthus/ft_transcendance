type UserBasic = {
    username: string;
    slug: string;
};

type AuthSuccess = { ok: true; token: string; user: UserBasic };
type Failure = { ok: false; error: string };

export type LoginResult = AuthSuccess | Failure;

export async function loginUser(username: string, password: string): Promise<LoginResult> 
{
    const res = await fetch('/api/user/login', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) 
    {
        localStorage.setItem("token", data.token);
        return { ok: true, token: data.token, user: { username: data.username, slug: data.slug } };
    } 
    return { ok: false, error: data.error};
}