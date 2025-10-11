type NotifSuccess = {ok: true, notifs: AllNotifs[]};
type Failure = { ok: false; error: string };

export type AllNotifs = 
{
    slug: string;
    notif_type: string;
    notif_status: number;
    //tournament_name: string;
    //sender_slug: string;
    created_at: string;
};

type NotifResult = NotifSuccess | Failure;

export const getAllNotifications = () => getNotifications('/api/user/notifications/');
export const getUnreadNotifications = () => getNotifications('/api/user/notifications/unread');
export const getReadNotifications = () => getNotifications('/api/user/notifications/read');

export async function   getNotifications(url: string): Promise<NotifResult>
{    
    try 
    {
        const res = await fetch(url, 
        {
            method: 'GET',
            credentials: 'include',
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