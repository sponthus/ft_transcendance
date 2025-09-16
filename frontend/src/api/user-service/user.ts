// User infos possible to give back
type UserBasic = {
    username: string;
    slug: string;
};
type UserFull = UserBasic & {
    id: number;
    avatar: string;
    created_at: string;
};

// Possible results for request
type AuthSuccess = { ok: true; token: string; user: UserBasic };
type AuthFullSuccess = { ok: true; token: string; user: UserFull };
type AvatarUploadSuccess = { ok: true; avatar: string };
type UserModificationSuccess = { ok: true; user: UserBasic; token: string}
type Failure = { ok: false; error: string };

// Union of possibilities for the type of answer
//export type LoginResult = AuthSuccess | Failure;
export type RegisterResult = AuthSuccess | Failure;
export type GetUserResult = AuthFullSuccess | Failure;
export type AvatarUploadResult = AvatarUploadSuccess | Failure;
export type UserModificationResult = UserModificationSuccess | Failure;


// PUT /api/user/:slug/avatar request to change avatar path
export async function modifyUserAvatar(slug: string, avatar: string): Promise<AvatarUploadResult> {
    const token = localStorage.getItem("token");
    if (!token) {
        return { ok: false, error: "No token found" };
    }

    const res = await fetch(`/api/user/${slug}/avatar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar }),
    });
    if (res.ok) {
        console.log("Request for avatar path change accepted");
        const data = await res.json();
        return { ok: true, avatar: data.avatar };
    }
    else {
        const error = await res.json();
        return { ok: false, error: error?.error || "Info not received from back" };
    }
}

