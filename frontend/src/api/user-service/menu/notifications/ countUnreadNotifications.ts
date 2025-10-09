type NotifSuccess = {ok: true, count: number }
type Failure = { ok: false; error: string };

type NotifResult = NotifSuccess | Failure;

export async function   countUnreadNotifications(): Promise<NotifResult>
{
    try 
    {
        const res = await fetch('/api/user/notifications/mark', 
        {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();    
        if (res.ok) 
        {
            return { ok: true, count: data.count};
        }
        return { ok: false, error: data.error};
    }
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}