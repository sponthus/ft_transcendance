type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

// DELETE /tournament/:tournamentId
// Delete a tournament in backend and its games
// Security : is gonna be possible only if the logged-in user is the owner of the game
export async function deleteTournament(tournamentId: number): Promise<SimpleResult> {
	if (!tournamentId)
		return {ok: false, error: 'tournamentId required'};
	try {
		const response = await fetch(`/api/games/tournament/${tournamentId}`, {
			method: 'DELETE',
			headers: { 
				'host': window.location.host,
				'content-type': 'application/json'
			},
			body: JSON.stringify({ tournamentId: tournamentId }),
            credentials: 'include'
		});
		if (!response.ok) {
			const data = await response.json();
			throw new Error(`Unable to delete tournament ->` + data.error);
		}
		const data = await response.json();
		return { ok: true, message: data.name + ' tournament has been ' + data.action }
	} catch(error) {
		return { ok: false, error: error as string  };
	}
}