type UserInfo = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
    id: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
};

type getUserInfoSuccess = {ok: true; userInfo: UserInfo}
type Failure = { ok: false; error: string };

export type GetUserInfoResult = getUserInfoSuccess | Failure 

export async function   getUserInfo() : Promise<GetUserInfoResult>
{
    const token = localStorage.getItem("token");
     if (!token)
        return { ok: false, error : "No token found" };
    const res = await fetch('api/user/user-info', 
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },    
    });
    const data = await res.json();
    if (res.ok)
    {
        return ({ ok: true, userInfo: data.userInfo })   
    }
    return ({ ok: false, error: data.error });
}