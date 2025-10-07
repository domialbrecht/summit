<script lang="ts">
	import Map from './StoryMap.svelte';
	import type maplibregl from 'maplibre-gl';
	import type { PageServerData } from './$types';
	import { dt } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import { BikeIcon } from 'lucide-svelte';
	import Navbar from '$lib/components/navbar.svelte';

	const { data }: { data: PageServerData } = $props();

	const milestones = [50, 100, 150, 200];
	const milestoneTexts: Record<number, string> = {
		50: 'Super Start ins Abenteuer!',
		100: 'Witer soooooooo',
		150: 'Du bisch e wahre Bergziege!',
		200: 'Unglaublich – du bisch e Legende!'
	};

	let mapComp: maplibregl.Map | undefined = $state();

	const zoomToSummit = (lat: string, long: string) => {
		if (!mapComp) return;
		mapComp.flyTo({ center: [parseFloat(long), parseFloat(lat)], zoom: 14 });
	};

	let observer: IntersectionObserver;
	let scroller: HTMLDivElement;

	let colorList = [
		'bg-pink-300',
		'bg-yellow-300',
		'bg-green-300',
		'bg-blue-300',
		'bg-purple-300',
		'bg-red-300',
		'bg-indigo-300'
	];

	const getColor = (index: number) => {
		return colorList[index % colorList.length];
	};

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLElement;
					if (entry.isIntersecting) {
						el.classList.add('active');

						// Read lat and long from the first child with data-latitude and data-longitude attributes
						const locEl = el.querySelector<HTMLElement>('[data-latitude][data-longitude]');
						if (locEl) {
							const lat = locEl.getAttribute('data-latitude');
							const long = locEl.getAttribute('data-longitude');
							if (lat && long) {
								zoomToSummit(lat, long);
							}
						}
					}
				}
			},
			{
				rootMargin: '0px 0px -85% 0px',
				threshold: 0
			}
		);

		// observe all cards inside the scroller
		scroller.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => observer.observe(el));

		if (data.activities.length > 0) {
			//Scroll to first card
			zoomToSummit(data.activities[0].attempts[0].lat, data.activities[0].attempts[0].long);
		}
	});

	onDestroy(() => observer?.disconnect());

	const getAttemptsCount = () => {
		return data.activities.reduce((sum, activity) => sum + activity.attempts.length, 0);
	};
</script>

<div class="grid h-screen w-full grid-cols-1 md:grid-cols-2">
	<Navbar user={data.user} />
	<div class="h-[50vh] md:h-full">
		<Map bind:map={mapComp} />
	</div>
	<div
		class="flex h-[50vh] max-h-[50vh] flex-col overflow-scroll px-12 md:-order-1 md:h-full md:max-h-screen"
		bind:this={scroller}
	>
		<div class="font-title pt-12 text-[clamp(1.5rem,6vw,4rem)] leading-none font-black md:pt-12">
			<span
				class="animate-pulse bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text font-extrabold text-transparent"
				>2025 Wrapped</span
			>
		</div>
		<p class="pt-4 text-xl">
			Im 2025 hesch du {getAttemptsCount()} Pässe gmacht! Nice! Lueg dir dis Jahr nomau im Rückblick
			a..
		</p>
		<div class="mt-8 flex grow flex-col gap-36">
			{#each data.activities as activity, index}
				<div class="group min-h-[30vh] w-full" data-card>
					<div class="flex flex-col gap-3 rounded-b-2xl shadow-2xl">
						<div
							class={`flex justify-between rounded-t-2xl px-4 py-2 text-2xl md:text-3xl ${getColor(index)}`}
						>
							<p class="">{activity.activityName}</p>
							<p class="">{dt(activity.date)}</p>
						</div>
						<div class="flex flex-col gap-3 p-4">
							{#each activity.attempts as item}
								<div data-longitude={item.long} data-latitude={item.lat}>
									<div class="flex justify-between gap-2">
										<p class="text-2xl">{item.summitName}</p>
										<button
											onclick={() => zoomToSummit(item.lat, item.long)}
											aria-label="Show"
											class="btn btn-circle"
										>
											<BikeIcon class="h-6 w-6" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
				{#if milestones.includes(index + 1)}
					<div class="rounded-2xl border-2 border-dashed p-6 text-center shadow-lg">
						<p class="text-3xl font-bold text-purple-500">
							🎉 Meilestei {index + 1} erreicht!
						</p>
						<p class="mt-2 text-lg">{milestoneTexts[index + 1]}</p>
					</div>
				{/if}
			{/each}
		</div>
		<p class="mt-8 mb-14 pt-4 text-xl">
			Vile Dank fürs Mitmache und bis bald uf em Berg! Grüessli, SolyVC Team
		</p>
	</div>
</div>
