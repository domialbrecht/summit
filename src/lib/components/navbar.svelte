<script lang="ts">
	import type { User } from '$lib/server/db/schema';
	import Menu from './menu.svelte';

	let { user }: { user: User | null } = $props();
</script>

<div class="navbar relative z-10 px-2 py-10 xl:px-16">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Summit</a>
	</div>
	<div class="flex flex-none items-center justify-center gap-4">
		<div>
			<Menu user />
		</div>
	</div>
</div>
