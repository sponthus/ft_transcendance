export type UserInfo =
{
    id?: number
    username: string;
    nickname: string;
    avatar: string;
    slug: string;
    created_at: string;
    friendship_status: string;
    twofa_enabled: number;
};

type getUserInfoSuccess = {ok: true; userInfo: UserInfo}
type Failure = { ok: false; error?: string };

export type GetUserInfoResult = getUserInfoSuccess | Failure 

export async function   getUserInfo() : Promise<GetUserInfoResult>
{
    try
    {
        const res = await fetch('/api/user/user-info', 
        {
            method: 'GET',
			headers: {
				'host': window.location.host
			},
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, userInfo: data.userInfo })   
        }
		if (res.status === 401)
			return ({ ok: false, error: undefined });
        return ({ ok: false, error: data.message });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}

export async function   getUserInfoBySlug(slug: string) : Promise<GetUserInfoResult>
{
    try
    {
        const res = await fetch(`/api/user/user-info/other/${slug}`, 
        {
            method: 'GET',
			headers: {
				'host': window.location.host
			},
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok)
        {
            return ({ ok: true, userInfo: data.userInfo })   
        }
        return ({ ok: false, error: data.message });
    }
    catch (err)
    {
        return ({ ok: false, error: "Network error" });
    }
}