
type UpdateNicknameSuccess = {ok: true }
type Failure = { ok: false; error: string };

export type UpdateNicknameResult = UpdateNicknameSuccess | Failure 

export async function   updateNickname(nickname: string): Promise<UpdateNicknameResult>
{
    try
    {
        const res = await fetch('/api/user/user-info/nickname', 
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nickname }),
        });
        if (res.ok)
        {
            console.log("Update nickname successful");
            return ( { ok: true } );
        }
        console.log("Update nickname failed");
        const data = await res.json();
        return ( { ok: false, error: data.message } );
    }
    catch (err)
    {
        return ( { ok: false, error: "Network error" } );
    }
}