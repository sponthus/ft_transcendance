
type UpdateNicknameSuccess = {ok: true; nickname: string}
type Failure = { ok: false; error: string };

export type UpdateNicknameResult = UpdateNicknameSuccess | Failure 

export async function   updateNickname(nickname: string): Promise<UpdateNicknameResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return { ok: false, error : "No token found" };
    const res = await fetch('api/user/user-info/nickname', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },    
        body: JSON.stringify({ nickname }),
    });
    const data = await res.json();
    if (res.ok)
    {
        console.log("Update nickname successful");
        return ( { ok: true, nickname: data.nickname } );
    }
    console.log("Update nickname failed");
    return ( { ok: false, error: data.error } );
    //alert pour dire que ca a echoué ? 
}