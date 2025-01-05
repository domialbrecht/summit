<script lang="ts">
	import type { SelectSummit, SelectArea } from '$lib/server/db/schema';
	import { Map, X } from 'lucide-svelte';

	let {
		summit_data,
		handleClick
	}: { summit_data: { summit: SelectSummit; areas: SelectArea[] }; handleClick: () => void } =
		$props();
</script>

<div class="flex items-center justify-between gap-6">
	<div class="flex items-end gap-4">
		<h1 class="font-title mb-0 text-[clamp(1.5rem,4vw,3rem)] font-black leading-none text-primary">
			{summit_data.summit.name}
		</h1>
		{#if summit_data.summit.alias}
			<span class="text-2xl font-bold text-slate-300">{summit_data.summit.alias}</span>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<a
			class="link-accent"
			href={`https://www.google.com/maps/search/?api=1&query=${summit_data.summit.lat},${summit_data.summit.long}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Map class="h-8 w-8" />
		</a>
		<button class="btn btn-ghost" onclick={handleClick}>
			<X class="h-8 w-8" />
		</button>
	</div>
</div>
<div class="mt-4 flex gap-2">
	{#each summit_data.areas as area}
		<span class="badge badge-info">{area.name}</span>
	{/each}
</div>
