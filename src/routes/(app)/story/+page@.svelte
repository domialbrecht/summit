<script lang="ts">
	import Map from './StoryMap.svelte';
	import type maplibregl from 'maplibre-gl';
	import type { PageServerData } from './$types';
	import { dt, km } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	const { data }: { data: PageServerData } = $props();

	let mapComp: maplibregl.Map | undefined = $state();

	const zoomToSummit = (lat: string, long: string) => {
		if (!mapComp) return;
		mapComp.flyTo({ center: [parseFloat(long), parseFloat(lat)], zoom: 14 });
	};

	let observer: IntersectionObserver;
	let scroller: HTMLDivElement;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLElement;
					if (entry.isIntersecting) {
						el.classList.add('active');
						const lat = el.dataset.latitude;
						const long = el.dataset.longitude;
						if (lat && long) zoomToSummit(lat, long);
					}
				}
			},
			{ root: scroller, threshold: 0.5 } // 50% visible inside our scroll area
		);

		// observe all cards inside the scroller
		scroller.querySelectorAll<HTMLElement>('.card').forEach((el) => observer.observe(el));
	});

	onDestroy(() => observer?.disconnect());
</script>

<div class="grid h-screen w-full grid-cols-2">
	<div class="h-full">
		<Map bind:map={mapComp} />
	</div>
	<div class="full flex max-h-screen flex-col overflow-scroll px-12" bind:this={scroller}>
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
			<span
				class="animate-pulse bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-5xl font-extrabold text-transparent"
				>2025 Wrapped</span
			>
		</div>
		<p class="pt-4 text-xl">
			Im 2025 hesch du {data.activities.length} Pässe gmacht! Nice! Lueg dir dis Jahr nomau im Rückblick
			a..
		</p>
		<div class="mt-8 flex grow flex-col gap-8">
			{#each data.activities as item}
				<div
					class="card [&.active]:bg-primary h-100 w-full shadow-sm transition-colors lg:h-220 [&.active]:text-white"
					data-longitude={item.long}
					data-latitude={item.lat}
				>
					<div class="flex h-full items-center justify-center">
						<p class="text-5xl">{item.summitName}</p>
					</div>
				</div>
			{/each}
		</div>
		<p class="mt-8 mb-4 pt-4 text-xl">
			Vile Dank fürs Mitmache und bis bald uf em Berg! Grüessli, SolyVC Team
		</p>
	</div>
</div>
