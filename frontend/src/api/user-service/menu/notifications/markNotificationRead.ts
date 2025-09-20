type NotifSuccess = { ok: true }
type Failure = { ok: false; error: string };

type NotifResult = NotifSuccess | Failure;

export async function   markNotificationsRead(): Promise<NotifResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    
    try 
    {
        const res = await fetch("/api/user/notifications/mark", 
        {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) 
        {
            return { ok: true };
        }
        const data = await res.json();    
        return { ok: false, error: data.error};
    }
    catch (err)
    {
            return { ok: false, error: "Network error" };
    }
}