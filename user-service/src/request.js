export async function sendRequestToUser(idSender, sender, receiver) {
    const api_key = getSecret('api_key');

    const res = await fetch(`/api/game-service/message/${idSender}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': api_key
        },
        body: JSON.stringify({ sender, receiver }),
    });
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}
