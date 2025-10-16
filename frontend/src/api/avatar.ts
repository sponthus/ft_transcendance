// Possible results for request
type AvatarUploadSuccess = { ok: true };
type Failure = { ok: false; error: string };

// Union of possibilities for the type of answer
export type AvatarUploadResult = AvatarUploadSuccess | Failure;

// POST /api/user/:slug to upload a new avatar file to the system
export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
    
    // TODO = Check the file here ?
    // for (const [key, value] of formData.entries()) {
    //     console.log(`${key}:`, value);
    // } // Debug
    const res = await fetch(`/api/avatars/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
    });

    if (res.ok)
        return { ok: true }
    const data = await res.json();
    return { ok: false, error: data.error || "Upload problem" }
}