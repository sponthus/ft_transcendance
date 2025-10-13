// Possible results for request
type AvatarUploadSuccess = { ok: true; avatar: string };
type Failure = { ok: false; error?: string };

// Union of possibilities for the type of answer
export type AvatarUploadResult = AvatarUploadSuccess | Failure;

// POST /api/user/:slug to upload a new  file to the system
export async function upload(formData: FormData): Promise<AvatarUploadResult> {

    // TODO = Check the file here ?
    // for (const [key, value] of formData.entries()) {
    //     console.log(`${key}:`, value);
    // } // Debug
    const res = await fetch(`/api/avatars/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
    });

    if (res.ok) {
        console.log("Request for user info accepted");
        const data = await res.json();
        return { ok: true, avatar: data.avatar }
    }
    else {
        const error = await res.json();
        return { ok: false,
            error: error?.error || "Upload problem" }
    }
}