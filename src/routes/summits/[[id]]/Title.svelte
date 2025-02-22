<script lang="ts">
	import type { SelectSummit, SelectArea } from '$lib/server/db/schema';
	import { Map, X, Crosshair } from 'lucide-svelte';

	let {
		summit_data,
		handleClick,
		handleTarget
	}: {
		summit_data: { summit: SelectSummit; areas: SelectArea[] };
		handleClick: () => void;
		handleTarget: (lat: string, long: string) => void;
	} = $props();
</script>

<div class="flex flex-col items-center justify-between gap-1 xl:flex-row">
	<div class="flex shrink flex-col flex-wrap gap-2 xl:flex-row xl:gap-4">
		<h1 class="font-title mb-0 text-[clamp(1.5rem,4vw,3rem)] font-black leading-none text-primary">
			{summit_data.summit.name}
		</h1>
		{#if summit_data.summit.alias}
			<span class="text-2xl font-bold text-slate-300">{summit_data.summit.alias}</span>
		{/if}
	</div>
	<div class="flex shrink-0 items-center gap-2">
		<button
			class="btn btn-ghost text-accent"
			onclick={() => handleTarget(summit_data.summit.lat, summit_data.summit.long)}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Crosshair class="h-6 w-6" />
		</button>
		<a
			class="link-accent"
			href={`https://www.google.com/maps/search/?api=1&query=${summit_data.summit.lat},${summit_data.summit.long}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Map class="h-6 w-6" />
		</a>
		<button class="btn btn-ghost" onclick={handleClick}>
			<X class="h-6 w-6" />
		</button>
	</div>
</div>
<div class="mt-4 flex gap-2">
	{#each summit_data.areas as area}
		<span class="badge badge-info">{area.name}</span>
	{/each}
</div>
