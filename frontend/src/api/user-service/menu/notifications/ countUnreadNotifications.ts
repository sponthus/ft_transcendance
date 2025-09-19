type NotifSuccess = {ok: true, count: number }
type Failure = { ok: false; error: string };

type NotifResult = NotifSuccess | Failure;

export async function   countUnreadNotifications(): Promise<NotifResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    
    try 
    {
        const res = await fetch("/api/user/notifications/unread/count", 
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();    
        if (res.ok) 
        {
            console.log('count front : ', data.count);
            return { ok: true, count: data.count};
        }
        return { ok: false, error: data.error};
    }
    catch (err)
    {
            return { ok: false, error: "Network error" };
    }
}