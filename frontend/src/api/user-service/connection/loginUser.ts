type UserBasic = {
    username: string;
    slug: string;
};

type AuthSuccess = { ok: true, twoFaEnabled: boolean};
type Failure = { ok: false; error: string };

export type LoginResult = AuthSuccess | Failure;

export async function loginUser(username: string, password: string): Promise<LoginResult> 
{
    const res = await fetch('/api/user/login', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    const data = await res.json();
    if (res.ok) 
    {
        localStorage.setItem("token", data.token);
        return { ok: true, twoFaEnabled: data.twoFaEnabled};
    } 
    return { ok: false, error: data.error};
}