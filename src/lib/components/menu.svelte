<script lang="ts">
	import SolYVC from '$site/solyvc.svg';
	import { page } from '$app/stores';
	import Strava from '$lib/components/icons/strava.svelte';
	import type { User } from '$lib/server/db/schema';
	let { user }: { user: User | undefined } = $props();
</script>

<ul
	class="menu menu-horizontal items-center justify-center rounded-box bg-slate-50 ring-2 ring-primary"
>
	<li>
		<a
			href="/"
			class="tooltip"
			class:active={$page.url.pathname === '/'}
			data-tip="Home"
			aria-label="Home"
		>
			<img src={SolYVC} alt="SolYVC" class="w-5" />
		</a>
	</li>
	<li>
		<a
			href="/summits"
			class="tooltip"
			class:active={$page.url.pathname.includes('/summits')}
			data-tip="Päss"
			aria-label="Summits"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-5 w-5"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg
			>
		</a>
	</li>
	<li>
		<a
			href="/leaderboard"
			class="tooltip"
			class:active={$page.url.pathname === '/leaderboard'}
			data-tip="Rangliste"
			aria-label="Rangliste"
			><svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-5 w-5"
				><path
					d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"
				/><path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" /><path d="M8 7h8" /><circle
					cx="12"
					cy="17"
					r="5"
				/><path d="M12 18v-2h-.5" /></svg
			></a
		>
	</li>
	<li>
		<a
			href={user ? '/logout' : '/login'}
			class="tooltip"
			data-tip={user ? 'Logout' : 'Login'}
			aria-label={user ? 'Logout' : 'Login'}
		>
			{#if user}
				<img class="h-5 w-5 rounded-full" src={user.profile} alt="User" />
			{:else}
				<Strava class="h-5 w-5 fill-orange-500" />
			{/if}
		</a>
	</li>
</ul>
