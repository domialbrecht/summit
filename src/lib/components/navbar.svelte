<script lang="ts">
	import type { User } from '$lib/server/db/schema';
	import Menu from './menu.svelte';

	let { user }: { user: User | undefined } = $props();
</script>

<div class="navbar fixed right-4 top-8 z-10 flex w-auto justify-end px-2">
	<div>
		<Menu {user} />
	</div>
</div>
