type UpdatePasswordSuccess = {ok: true }
type Failure = { ok: false; error: string };

export type UpdatePasswordResult = UpdatePasswordSuccess | Failure 

export async function   updatePassword(password: string): Promise<UpdatePasswordResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    const res = await fetch('/api/user/user-info/password', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },    
        body: JSON.stringify({ password }),
    });
    if (res.ok)
    {
        console.log("Update password successful");
        return ({ ok: true });
    }
    console.log("Update password failed");
    const data = await res.json();
    return ({ ok: false, error: data.error });
}