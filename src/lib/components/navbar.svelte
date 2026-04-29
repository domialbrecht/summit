<script lang="ts">
	import type { User } from '$lib/server/db/schema';
	import { page } from '$app/stores';
	import Menu from './menu.svelte';

	let {
		user
	}: {
		user: User | undefined;
	} = $props();
</script>

<div class="navbar fixed top-8 right-4 z-10 flex w-auto justify-end px-2">
	<div>
		<Menu {user} activeClub={$page.data.activeClub} userClubs={$page.data.userClubs ?? []} />
	</div>
</div>
