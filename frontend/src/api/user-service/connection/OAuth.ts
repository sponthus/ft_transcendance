/*type Success = {ok: true }
type Failure = { ok: false; error: string };

type OAuthResult = Success | Failure;

export async function   connectWithGithub(): Promise<OAuthResult>
{
    try 
    {
        const res = await fetch('/api/user/oauth/github', 
        {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();    
        if (res.ok) 
        {
            return { ok: true };
        }
        return { ok: false, error: data.message};
    }
    catch (err)
    {
            return { ok: false, error: "Network error" };
    }
}*/

/*function    connectWithGithub(): void
{
    window.location.href = '/api/user/oauth/github';
}*/