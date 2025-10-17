type Failure = { ok: false; error: string };
type UserModificationSuccess = { ok: true; token: string}

export type UserModificationResult = UserModificationSuccess | Failure;

export async function updateUsername(username: string): Promise<UserModificationResult> 
{ 
    try
    {
        const res = await fetch(`/api/user/user-info/username`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (res.ok) 
        {
            // localStorage.setItem("token", data.token);
            return {ok: true, token: data.token};
        }
        return { ok: false, error: data.error};
    }
    catch (err)
    {
        return { ok: false, error: "Network error"};
    }
}
