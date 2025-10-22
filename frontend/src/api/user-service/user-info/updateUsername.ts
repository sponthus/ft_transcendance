type Failure = { ok: false; error: string };
type UserModificationSuccess = { ok: true }

export type UserModificationResult = UserModificationSuccess | Failure;

export async function updateUsername(username: string): Promise<UserModificationResult> 
{ 
    try
    {
        const res = await fetch(`/api/user/user-info/username`,
        {
            method: 'PATCH',
            headers: { 
				'Content-Type': 'application/json',
				'host': window.location.host
			},
            credentials: 'include',
            body: JSON.stringify({ username }),
        });
        if (res.ok) 
        {
            return {ok: true };
        }
        const data = await res.json();
        return { ok: false, error: data.message};
    }
    catch (err)
    {
        return { ok: false, error: "Network error"};
    }
}
