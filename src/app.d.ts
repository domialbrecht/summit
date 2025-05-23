// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/session').SessionValidationResult['user'];
			session: import('$lib/server/session').SessionValidationResult['session'];
		}
		interface PageData {
			user?: import('$lib/server/session').SessionValidationResult['user'];
		}
	}
}

export {};
