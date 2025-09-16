type UserBasic = {
    username: string;
    slug: string;
};

type Failure = { ok: false; error: string };
type UserModificationSuccess = { ok: true; user: UserBasic; token: string}

export type UserModificationResult = UserModificationSuccess | Failure;

export async function updateUsername(username: string): Promise<UserModificationResult> 
{
    const token = localStorage.getItem("token");
    if (!token) {
        return { ok: false, error: "No token found" };
    }
    const res = await fetch(`/api/user/user-info/username`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok) 
    {
        console.log("New username accepted");
        localStorage.setItem("token", data.token); //mise a jour token avec le nouveau username
        return {ok: true, user: data.user, token: data.token};
    }
    return { ok: false, error: data.error};
}
