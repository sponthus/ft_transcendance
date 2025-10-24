export type UserStatus = {
	status: 'online' | 'disconnected';
	slug: string;
};

export type StatusResult = {
	ok: boolean;
	status?: UserStatus;
	error?: string;
};

// GET /:slug
// Gives the status of a user (online, offline), access it with req.status!.status
// Security : Accessible for every logged-in user
export async function getUserStatus(slug: string): Promise<StatusResult> {
	if (!slug) {
		return { ok: false, error: 'Slug is required' };
	}
	try {
		const response = await fetch(`/api/session/${slug}`, {
			method: 'GET',
			headers: {
				'host': window.location.host
			},
			credentials: 'include',
		});

		if (!response.ok) {
			const data = await response.json();
			if (data?.error) {
				return { ok: false, error: data.error as string };
			} else {
				return { ok: false, error: "Unable to get status" };
			}
		}

		const status: UserStatus = await response.json();
		return { ok: true, status: status };

	} catch (error) {
		console.error('❌ Error fetching user status:', error);
		return { ok: false, error: error as string  };
	}
}