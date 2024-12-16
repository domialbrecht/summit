<script lang="ts">
	import { page } from '$app/stores';
	import Strava from '$lib/components/icons/strava.svelte';
	import type { User } from '$lib/server/db/schema';

	let { user }: { user: User | null } = $props();
</script>

<ul class="menu menu-horizontal rounded-box bg-slate-50 ring-2 ring-accent">
	<li>
		<a
			href="/"
			class="tooltip"
			class:active={$page.url.pathname === '/'}
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
				<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path
					d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
				/>
			</svg>
		</a>
	</li>
	<li>
		<a
			href="/summits"
			class="tooltip"
			class:active={$page.url.pathname === '/summits'}
			data-tip="Summits"
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
			class="tooltip text-base leading-[1.2]"
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
		<div class="dropdown dropdown-left tooltip" data-tip="Me">
			<div tabindex="0" role="button">
				<Strava class="h-5 w-5 fill-orange-500" />
			</div>
			<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
				{#if user}
					<li><a href="/me">Profil</a></li>
					{#if user.isAdmin}
						<li><a href="/admin">Admin</a></li>
					{/if}
					<li><a href="/logout">Logout</a></li>
				{:else}
					<li><a href="/login">Login</a></li>
				{/if}
			</ul>
		</div>
	</li>
</ul>
