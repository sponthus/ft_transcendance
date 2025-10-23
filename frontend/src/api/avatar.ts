// Possible results for request
type AvatarUploadSuccess = { ok: true, avatar: string};
type Failure = { ok: false; error: string };

// Union of possibilities for the type of answer
export type AvatarUploadResult = AvatarUploadSuccess | Failure;

// POST /api/user/:slug to upload a new avatar file to the system
export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult>
{
    try
    {
        const res = await fetch(`/api/avatars/`,
        {
            method: 'PUT',
			headers: {
				'host': window.location.host // Content-type automatically set with size
			},
            credentials: 'include',
            body: formData,
        });

       const data = await res.json();
        if (res.ok)
            return { ok: true, avatar: data.avatar }
        return { ok: false, error: data.error || "Upload problem" }
    }
    catch (err)
    {
        return {ok: false, error: "Network error" };
    }
}