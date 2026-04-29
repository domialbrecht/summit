// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/session').SessionValidationResult['user'];
			session: import('$lib/server/session').SessionValidationResult['session'];
			activeClub: import('$lib/server/db/schema').Club | null;
			userClubs: Array<{
				club: import('$lib/server/db/schema').Club;
				role: string;
				joinedAt: Date;
			}>;
		}
		interface PageData {
			user?: import('$lib/server/session').SessionValidationResult['user'];
		}
	}
}

export {};
