type UserInfo = //VA ETRE CHANGER, le token renvoie le username et l'id du user
{
    id?: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
    friendship_status: string;
};

type getUserInfoSuccess = {ok: true; userInfo: UserInfo}
type Failure = { ok: false; error?: string };

export type GetUserInfoResult = getUserInfoSuccess | Failure 

export async function   getUserInfo() : Promise<GetUserInfoResult>
{
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("getUserInfo : no token found");
		return { ok: false };
	}
    const res = await fetch('/api/user/user-info', 
    {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },    
    });
    const data = await res.json();
    if (res.ok)
    {
        return ({ ok: true, userInfo: data.userInfo })   
    }
    return ({ ok: false, error: data.error });
}

export async function   getUserInfoBySlug(slug: string) : Promise<GetUserInfoResult>
{
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("getUserInfo : no token found");
		return { ok: false };
	}
    const res = await fetch(`/api/user/user-info/other/${slug}`, 
    {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }, 
    });
    const data = await res.json();
    if (res.ok)
    {
        return ({ ok: true, userInfo: data.userInfo })   
    }
    return ({ ok: false, error: data.error });
}