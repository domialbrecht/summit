<script lang="ts">
	import { page } from '$app/stores';
	import { Award, LogIn } from 'lucide-svelte';
	import type { User, Club } from '$lib/server/db/schema';
	import ClubSwitcher from './club-switcher.svelte';

	let {
		user,
		activeClub = null,
		userClubs = []
	}: {
		user: User | undefined;
		activeClub?: Club | null;
		userClubs?: Array<{ club: Club; role: string }>;
	} = $props();
</script>

<ul
	class="menu menu-horizontal rounded-box ring-primary items-center justify-center bg-slate-50 ring-2"
>
	<li>
		<a
			href="/"
			class="tooltip"
			class:menu-active={$page.url.pathname === '/'}
			data-tip="Home"
			aria-label="Home"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-5 w-5"
			>
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		</a>
	</li>
	<li>
		<a
			href="/summits"
			class="tooltip"
			class:menu-active={$page.url.pathname.includes('/summits')}
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
			class:menu-active={$page.url.pathname.includes('/leaderboard')}
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
	{#if user}
		<li>
			<a
				href="/challenges"
				class="tooltip"
				class:menu-active={$page.url.pathname.includes('/challenges')}
				data-tip="Challanges"
				aria-label="Challanges"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-5 w-5"
					><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path
						d="M2 12l10 5 10-5"
					/></svg
				>
			</a>
		</li>
		<li>
			<a
				href="/achievements"
				class="tooltip"
				class:menu-active={$page.url.pathname.includes('/achievements')}
				data-tip="Erfolge"
				aria-label="Erfolge"
			>
				<Award class="h-5 w-5" />
			</a>
		</li>
		<ClubSwitcher {activeClub} {userClubs} />
	{/if}
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
				<LogIn class="h-5 w-5" />
			{/if}
		</a>
	</li>
</ul>
