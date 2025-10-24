type NotifSuccess = { ok: true }
type Failure = { ok: false; error: string };

type NotifResult = NotifSuccess | Failure;

export async function   markNotificationsRead(): Promise<NotifResult>
{
    try 
    {
        const res = await fetch("/api/user/notifications/mark", 
        {
            method: 'POST',
			headers: {
				'host': window.location.host,
				'content-type': 'application/json'
			},
			body: JSON.stringify({action: 'markRead'}),
            credentials: 'include',
        });
        if (res.ok) 
        {
            return { ok: true };
        }
        const data = await res.json();    
        return { ok: false, error: data.message};
    }
    catch (err)
    {
        return { ok: false, error: "Network error" };
    }
}