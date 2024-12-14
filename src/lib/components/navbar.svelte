<script lang="ts">
	import type { User } from '$lib/server/db/schema';
	import Strava from './icons/strava.svelte';

	let { user }: { user: User | null } = $props();
</script>

<div class="navbar relative z-10 px-2 py-10 xl:px-16">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Summit</a>
	</div>
	<div class="flex-none">
		{#if user}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="avatar btn btn-circle btn-ghost">
					<div class="w-10 rounded-full">
						<img alt="Tailwind CSS Navbar component" src={user.profile} />
					</div>
				</div>
				<ul
					class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<a href="/me" class="justify-between">Mini Date</a>
					</li>
					<li><a href="/logout">Uslogge</a></li>
				</ul>
			</div>
			<!-- content here -->
		{:else}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-circle bg-orange-600">
					<div class="flex w-10 items-center justify-center rounded-full">
						<Strava class="h-6 w-6 fill-white" />
					</div>
				</div>
				<ul
					class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<a href="/me" class="justify-between">Login</a>
					</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
