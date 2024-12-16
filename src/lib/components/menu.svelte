<script lang="ts">
	import Strava from '$lib/components/icons/strava.svelte';
	import type { User } from '$lib/server/db/schema';

	let { user }: { user: User | null } = $props();
</script>

<ul class="menu menu-horizontal rounded-box bg-base-200">
	<li>
		<a href="/" class="tooltip" data-tip="Home">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		</a>
	</li>
	<li>
		<a href="/summits" class="tooltip" data-tip="Summits">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</a>
	</li>
	<li>
		<div class="dropdown dropdown-bottom tooltip" data-tip="Me">
			<div tabindex="0" role="button">
				<Strava class="h-5 w-5 fill-orange-500" />
			</div>
			<ul tabindex="0" class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
				{#if user}
					<!-- content here -->
				{:else}{/if}
				<li><a href="/me">Item 1</a></li>
				<li><a href="/admin">Item 2</a></li>
			</ul>
		</div>
	</li>
</ul>
