type RequestSuccess = {ok: true, requests?: any[]}
type Failure = { ok: false; error: string };

export type RequestResult = RequestSuccess | Failure;

export async function   acceptRequest(slug :string): Promise<RequestResult>
{
    const res = await fetch('/api/user/menu/friendslist/request', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error};
}

export async function   rejectRequest(slug :string): Promise<RequestResult>
{
    const res = await fetch('/api/user/menu/friendslist/request', 
    {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug }),
    });
    if (res.ok) 
    {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error};
}

export async function   getSentRequests(): Promise<RequestResult>
{
    const res = await fetch('/api/user/menu/friendslist/request/sent', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();    
    if (res.ok)
    {
        return { ok: true,  requests: data.requests};
    }
    return { ok: false, error: data.error};
}

export async function   getReceivedRequests(): Promise<RequestResult>
{
    const res = await fetch('/api/user/menu/friendslist/request/received', 
    {
        method: 'GET',
        credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) 
    {
        return { ok: true,  requests: data.requests};
    }
    return { ok: false, error: data.error};
}

