<script lang="ts">
	import type { User } from '$lib/server/db/schema';

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
						<a href="/me" class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/logout">Logout</a></li>
				</ul>
			</div>
			<!-- content here -->
		{/if}
	</div>
</div>
