<script lang="ts">
	import AreaCard from './area.svelte';
	import Section from '$lib/components/ui/section';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<Section sectionId="table">
	<div class="font-title text-primary text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		Regio Erfolge
	</div>
	<p class="pt-4">
		Regio Erfolge si persönlechi Ziel e Gruppe a Päss komplett abgschlosse z ha. Derbi muesch
		mindestens jede einisch erledigt ha. Unabhängig dervo obde z erste bisch oder nid.
	</p>
	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		{#await data.areas}
			<div class="skeleton h-44 xl:col-span-4"></div>
			<div class="skeleton h-44 xl:col-span-4"></div>
			<div class="skeleton h-44 xl:col-span-4"></div>
		{:then entries}
			{#each entries as entry}
				<AreaCard {...entry} />
			{/each}
		{/await}
	</div></Section
>
