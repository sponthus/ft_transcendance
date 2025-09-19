type NotifSuccess = {ok: true, notifs: AllNotifs }
type Failure = { ok: false; error: string };

type AllNotifs = 
{
    username: string;
    notif_type: string;
    notif_status: number;
    created_at: string;
}[];

type NotifResult = NotifSuccess | Failure;

export const getAllNotifications = () => getNotifications('/api/user/notifications/');
export const getUnreadNotifications = () => getNotifications('/api/user/notifications/unread');
export const getReadNotifications = () => getNotifications('/api/user/notifications/read');

export async function   getNotifications(url: string): Promise<NotifResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    
    try 
    {
        const res = await fetch(url, 
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();    
        if (res.ok) 
        {
            return { ok: true, notifs: data.notifs};
        }
        return { ok: false, error: data.error};
    }
    catch (err)
    {
            return { ok: false, error: "Network error" };
    }
}