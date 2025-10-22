type UpdatePasswordSuccess = {ok: true }
type Failure = { ok: false; error: string };

export type UpdatePasswordResult = UpdatePasswordSuccess | Failure 

export async function   updatePassword(password: string): Promise<UpdatePasswordResult>
{
    try
    {
        const res = await fetch('/api/user/user-info/password', 
        {
            method: 'PATCH',
            headers: { 
				'Content-Type': 'application/json',
				'host': window.location.host
			},
            credentials: 'include',
            body: JSON.stringify({ password }),
        });
        if (res.ok)
        {
            console.log("Update password successful");
            return ({ ok: true });
        }
        console.log("Update password failed");
        const data = await res.json();
        return ({ ok: false, error: data.message });
    }
    catch (err)
    { 
        return ({ ok: false, error: "Network error" });
    }
}