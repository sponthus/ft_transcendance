import { getSecret } from "./index.js";

export async function sendRequestToUser(idSender, sender, receiver) {
    const api_key = getSecret('api_key');

    console.log('\nidSender = ', idSender);
    console.log('\nsender = ', sender);
    console.log('\nreceiver = ', receiver);
    const res = await fetch(`http://api-gateway:3000/api/games/message/${idSender}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': api_key
        },
        body: JSON.stringify({ sender, receiver }),
    });
    if (res.ok) {
        return { ok: true };
    }
    const data = await res.json();    
    return { ok: false, error: data.error };
}
