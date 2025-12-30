<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import Navbar from '$lib/components/navbar.svelte';
	import Profile from './Profile.svelte';
	import Medals from './Medals.svelte';
	import Wins from './Wins.svelte';
	import Free from './Free.svelte';
	import Title from './Title.svelte';
	import Search from './Search.svelte';
	import SeasonToggle from './SeasonToggle.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;

	let activeSummit = $derived(data.summit_data ? data.summit_data.summit : null);
	let open = $state(false);

	let showSeasonOnly = $state(true);
	let mapUrl = $derived(showSeasonOnly ? '/summits/geojson?season=active' : '/summits/geojson');

	let mapComp: maplibregl.Map | undefined = $state();

	$effect(() => {
		if (!activeSummit) {
			return;
		}
		const { lat, long } = activeSummit;
		if (page.url.searchParams.has('reveal')) {
			zoomToSummit(lat, long);
		} else {
			open = true;
			if (mapComp) {
				mapComp.flyTo({ center: [parseFloat(long), parseFloat(lat)], zoom: 14 });
			}
		}
	});

	const zoomToSummit = (lat: string, long: string) => {
		if (!mapComp) return;
		open = false;
		mapComp.flyTo({ center: [parseFloat(long), parseFloat(lat)], zoom: 14 });
	};
</script>

<svelte:head>
	<title>{data.summit_data ? data.summit_data.summit.name : 'SolyVC Summits'}</title>
	<meta
		property="og:title"
		content={data.summit_data ? data.summit_data.summit.name : 'SolyVC Summits'}
	/>
	<meta
		property="og:description"
		content={data.summit_data ? data.summit_data.summit.name : 'SolyVC Summits'}
	/>
	<meta property="og:image" content="https://summit.solyvc.com/android-chrome-512x512.png" />
	<meta property="og:url" content="https://summit.solyvc.com/android-chrome-512x512.png" />
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<div class="h-screen w-full">
				<div
					class="fixed right-2 bottom-10 left-2 z-10 flex w-auto justify-end px-2 lg:top-2 lg:right-auto lg:bottom-auto lg:left-10"
				>
					<div class="flex items-center gap-4">
						<Search
							handleSearch={(lat: string, long: string) => {
								zoomToSummit(lat, long);
							}}
						/>
						<SeasonToggle bind:showSeason={showSeasonOnly} />
					</div>
				</div>
				<SummitMap bind:map={mapComp} handleClick={() => (open = true)} {mapUrl} />
			</div>
			<Drawer.Root direction="left" bind:open>
				<Drawer.Content contentProps={{ variant: 'left' }} class="lg:w-1/2">
					{#if data.summit_data}
						<div class="m-4 flex min-h-0 grow flex-col gap-6 overflow-y-auto">
							<div class="bg-base-100 order-first">
								<Title
									summit_data={data.summit_data}
									handleClick={() => (open = false)}
									handleTarget={zoomToSummit}
								/>
							</div>
							<div class="flex grow flex-col gap-4">
								<div id="summit-wins">
									{#each data.seasons as s (s.season)}
										<div class="collapse-arrow collapse">
											<input type="checkbox" name="accordion-2" checked={s.isActive} />
											<div class="collapse-title text-xl font-medium">Trophäe {s.season}</div>
											<div class="collapse-content">
												{#await s.summit_wins}
													<div class="skeleton h-40 w-full"></div>
												{:then wins}
													{#if wins.length > 0}
														<Wins {wins} />
													{:else}
														<Free />
													{/if}
												{/await}
												{#await s.summit_medals then medals}
													{#if medals.length > 0}
														<div class="border-base-200 mt-2 border-t-2 pt-1">
															<Medals {medals} />
														</div>
													{/if}
												{/await}
											</div>
										</div>
									{/each}
								</div>
								<div id="summit-data">
									<div class="collapse-arrow bg-base-200 collapse">
										<input type="checkbox" name="accordion-1" />
										<div class="collapse-title text-xl font-medium">Beschribig</div>
										<div class="collapse-content">
											<div class="prose">
												{data.summit_data.summit.description}
											</div>
										</div>
									</div>
									{#await data.summit_profiles then profiles}
										{#if profiles.length > 0}
											<div class="collapse-arrow bg-base-200 collapse mt-2">
												<input type="checkbox" name="accordion-1" checked />
												<div class="collapse-title text-xl font-medium">Astige</div>
												<div class="collapse-content">
													<div class="flex flex-col gap-4">
														{#each profiles as profile (profile.segment)}
															<div class="bg-base-100 rounded-lg p-2">
																<Profile {profile} />
															</div>
														{/each}
													</div>
												</div>
											</div>
										{/if}
									{/await}
								</div>
							</div>
						</div>
					{/if}
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</div>
