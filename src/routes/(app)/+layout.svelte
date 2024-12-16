<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div>
	<div>
		<Navbar user={data.user} />
	</div>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-6 ps-6 pt-10">
			{@render children()}
		</div>
	</div>
</div>
