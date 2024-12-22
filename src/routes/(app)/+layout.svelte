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
	<div
		class="mb-20 flex flex-col gap-y-20 overflow-hidden pt-20 sm:mb-32 sm:gap-y-32 sm:pt-28 md:mb-40 md:gap-y-40 md:pt-32"
	>
		{@render children()}
	</div>
</div>
