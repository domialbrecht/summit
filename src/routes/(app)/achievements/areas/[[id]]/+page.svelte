<script lang="ts">
	import Section from '$lib/components/ui/section';
	import SummitCard from './areasummit.svelte';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
	const completion = $derived.by(async () => {
		const summits = await data.summits;
		const total = summits.length;
		const done = summits.filter((summit) => summit.done).length;
		return Math.ceil((done / total) * 100);
	});
</script>

<Section sectionId="areasummits">
	<div
		class="font-title text-primary mb-4 text-center text-[clamp(1.5rem,6vw,4rem)] leading-none font-black"
	>
		{data.area}
	</div>
	<div class="flex flex-col items-center gap-4">
		{#await completion}
			<p class="font-title font-light md:text-3xl lg:text-4xl"></p>
			<progress class="progress grow"></progress>
		{:then complete}
			<p class="font-title font-light md:text-3xl lg:text-4xl">{complete}%</p>
			<progress class="progress progress-primary grow" value={complete} max="100"></progress>
		{/await}
	</div>
	<div class="mt-6 grid gap-6 md:grid-cols-12">
		{#await data.summits}
			<div class="skeleton h-44 xl:col-span-4"></div>
			<div class="skeleton h-44 xl:col-span-4"></div>
			<div class="skeleton h-44 xl:col-span-4"></div>
		{:then summits}
			{#each summits as entry}
				<SummitCard {...entry} />
			{/each}
		{/await}
	</div>
</Section>
