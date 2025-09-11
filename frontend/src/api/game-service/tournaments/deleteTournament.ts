type Failure = { ok: false; error: string };
type Success = { ok: true; message: string };

type SimpleResult = Success | Failure;

// DELETE /tournament/:tournamentId
// Delete a tournament in backend and its games
// Security : is gonna be possible only if the logged-in user is the owner of the game
export async function deleteTournament(tournamentId: number): Promise<SimpleResult> {
	const token = localStorage.getItem("token");
	if (!token)
		return { ok: false, error: "No token"};

	if (!tournamentId)
		return {ok: false, error: 'tournamentId required'};
	try {
		const response = await fetch(`/api/games/tournament/${tournamentId}`, {
			method: 'DELETE',
			headers:  {
				// 'Content-Type': 'application/json', // Useless because no body provided
				'Authorization': `Bearer ${token}`
			}
		});
		if (!response.ok) {
			const data = await response.json();
			throw new Error(`Unable to delete tournament ->` + data.error);
		}
		return { ok: true, message: tournamentId + ' tournament has been deleted' };
	} catch(error) {
		return { ok: false, error: error as string  };
	}
}