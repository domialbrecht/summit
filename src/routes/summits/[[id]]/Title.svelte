<script lang="ts">
	import type { SelectSummit } from '$lib/server/db/schema';
	import { Map } from 'lucide-svelte';

	let { summit }: { summit: SelectSummit } = $props();
</script>

<div class="flex items-center justify-between gap-6">
	<div class="flex items-end gap-4">
		<h1 class="font-title mb-0 text-[clamp(1.5rem,4vw,3rem)] font-black leading-none text-primary">
			{summit.name}
		</h1>
		{#if summit.alias}
			<span class="text-2xl font-bold text-slate-300">{summit.alias}</span>
		{/if}
	</div>
	<div>
		<a
			class="link-accent"
			href={`https://www.google.com/maps/search/?api=1&query=${summit.lat},${summit.long}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Map class="h-8 w-8" />
		</a>
	</div>
</div>
