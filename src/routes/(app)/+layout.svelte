<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div>
	<div>
		<Navbar user={data.user} />
	</div>
	<div
		class="mb-20 flex flex-col gap-y-20 overflow-hidden pt-28 sm:mb-32 sm:gap-y-32 md:mb-40 md:gap-y-30 md:pt-32"
	>
		{@render children()}
	</div>
	<div class="section-normal bg-base-100 mx-auto mb-4 w-full max-w-7xl px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
