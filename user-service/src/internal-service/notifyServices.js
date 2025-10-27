import env from "../../config/env.js";
import { getSecret } from "../index.js";
import prefix from "../tools/url.js";
import tlsAgent from "../tools/tlsAgent.js";

export async function notifyRefresh(idReceivers, sender, message) 
{
    const api_key = getSecret('api_key');
	let receivers = [];
	if (typeof idReceivers === 'number')
		receivers = [idReceivers];
	else if (typeof idReceivers === 'string')
		receivers = [Number(idReceivers)];
	else if (Array.isArray(idReceivers) == true)
		receivers = idReceivers;
	console.log("💬 Notify refresh to session-service for users: ", receivers);
    try
    {
        const res = await fetch(`${prefix}://session-service:${env.session_port}/message`, 
        {
            method: 'POST',
            headers: 
            { 
                'Content-Type': 'application/json',
                'x-internal-api-key': api_key
            },
            body: JSON.stringify({ userIds: receivers, sender: sender, message: message }),
		    dispatcher: tlsAgent
	    });
        if (res.ok)
            return { ok: true };
        const data = await res.json();
		console.error("❌ Notify refresh didn't work : ", data);
        return { ok: false, message: data.error, status: res.status };
    }
    catch (err)
    {
        return { ok: false, message: err };
    }
}

export async function notifyChangeData(idUser, username, slug, status="online") 
{
	console.log("💬 Notify change data to session-service");
    const api_key = getSecret('api_key');
    try
    {
        const res = await fetch(`${prefix}://session-service:${env.session_port}/data/${idUser}`, 
        {
            method: 'PATCH',
            headers: 
            { 
                'Content-Type': 'application/json',
                'x-internal-api-key': api_key
            },
            body: JSON.stringify({ username: username, slug: slug, status: status }),
		    dispatcher: tlsAgent
	    });
        if (res.ok)
            return { ok: true };
        const data = await res.json();
		console.log("❌ Notify change didn't work : ", data);
        return { ok: false, message: data.error, status: res.status };
    }
    catch (err)
    {
		console.error("❌ Error notifying change data to session-service:", err);
        return { ok: false, message: err };
    }
}

export async function notifyChangeSlug(oldSlug, newSlug) 
{
    const api_key = getSecret('api_key');
    try
    {
        const res = await fetch(`${prefix}://upload-service:${env.upload_port}/update-name`, 
        {
            method: 'PATCH',
            headers: 
            { 
                'Content-Type': 'application/json',
                'x-internal-api-key': api_key
            },
            body: JSON.stringify({ oldName: oldSlug, newName: newSlug }),
		    dispatcher: tlsAgent
    	});
        if (res.ok)
            return { ok: true };
        const data = await res.json();    
        return { ok: false, message: data.error, status: res.status };
    }
    catch (err)
    {
        return { ok: false, message: data.error };
    }
}

export async function answerTournament(userId, ownerId, tournamentId, tournamentName, url) 
{
    const api_key = getSecret('api_key');

    try
    {
        const res = await fetch(url, 
        {
            method: 'POST',
            headers: 
            { 
                'x-internal-api-key': api_key,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(
            { 
                userId: userId,
                ownerUserId: ownerId,
                tournamentId: tournamentId,
                tournamentName: tournamentName
            }),
		    dispatcher: tlsAgent
	    });
        if (res.ok) {
            return { ok: true };
        }
        const data = await res.json();    
        return { ok: false, message: data.error, status: res.status };
    }
    catch (err)
    { 
        return { ok: false, message: data.error };
    }
}

