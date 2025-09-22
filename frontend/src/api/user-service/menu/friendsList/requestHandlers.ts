type RequestSuccess = {ok: true, requests?: any[]}
type Failure = { ok: false; error: string };

export type RequestResult = RequestSuccess | Failure;

export async function   acceptRequest(slug :string): Promise<RequestResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist/request', 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist/request', 
    {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist/request/sent', 
    {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
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
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/friendslist/request/received', 
    {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) 
    {
        return { ok: true,  requests: data.requests};
    }
    return { ok: false, error: data.error};
}

