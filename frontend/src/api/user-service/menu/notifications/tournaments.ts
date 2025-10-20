type Success = { ok: true };
type Failure = { ok: false; error: string };

export type Result = Success | Failure;


export async function   answerTournament(senderSlug: string, tournamentId: number, tournamentName: string, answer: string): Promise<Result>
{
    try
    {
        const res = await fetch('/api/user/notifications/tournament/answer', 
        {
            method: 'POST',
            headers: { 
				'Content-Type': 'application/json',
				'host': window.location.host
			},
            credentials: 'include',
            body: JSON.stringify(
            {   
                ownerSlug: senderSlug, 
                tournamentId: tournamentId,
                tournamentName: tournamentName,
                answer: answer 
            }),
        });
        if (res.ok)
        {
            return ({ ok: true });
        }
        const data = await res.json();
        return ({ ok:false, error: data.error });
    }
    catch (err)
    {
        return ({ ok:false, error: "Network error" });
    }
}