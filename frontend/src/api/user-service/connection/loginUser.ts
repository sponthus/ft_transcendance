type UserBasic = 
{
    username: string;
    slug: string;
};

type AuthSuccess = { ok: true, twoFaEnabled: number};
type Failure = { ok: false; error: string };

export type LoginResult = AuthSuccess | Failure;

export async function loginUser(username: string, password: string): Promise<LoginResult>
{
    try
    {
        const res = await fetch('/api/user/login',
        {
            method: 'POST',
            headers: { 
				'Content-Type': 'application/json', 
				'host': window.location.host 
			},
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok) 
        {
            return { ok: true, twoFaEnabled: data.twoFaEnabled };
        }
        return { ok: false, error: data.message };
    }
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}