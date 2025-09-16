import { getSecret } from "./index.js";

export async function	getAllUsers() {
	const api_key = getSecret('api_key');
	if (!api_key) {
		return ({ ok: false, error: "❌ Critical access to api_key error" });
	}

	// TODO : Modify me to fetch all users (id, username, slug)
	const data = [{
		userId: 0,
		username: "sponthus",
		slug: "sponthus"
	},
	{
		userId: 1,
		username: "matthew",
		slug: "matthew"
	}];

	// const res = await fetch(`http://api-gateway:3000/api/users/`, {
    //     method: 'GET',
    //     headers: { 
    //         'Content-Type': 'application/json',
    //         'x-internal-api-key': api_key
    //     },
    //     // body: JSON.stringify({ sender, receiver }),
    // });
    // if (res.ok) {
	// 	const data = await res.json();   
        return { ok: true, data: data };
    // }
    // const data = await res.json();    
    return { ok: false, error: data.error };
}