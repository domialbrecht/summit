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
	import type { PageServerData } from './$types';
	import { page } from '$app/state';

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;

	let activeSummit = $derived(data.summit_data ? data.summit_data.summit.id : null);
	let open = $state(false);

	let mapComp: maplibregl.Map | undefined = $state();

	$effect(() => {
		open = activeSummit ? true : false;
	});

	const zoomToSummit = (lat: string, long: string) => {
		if (!mapComp) return;
		open = false;
		mapComp.flyTo({ center: [parseFloat(long), parseFloat(lat)], zoom: 14 });
	};
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<div class="h-screen w-full">
				<SummitMap bind:map={mapComp} handleClick={() => (open = true)} />
			</div>
			<Drawer.Root direction={'left'} bind:open>
				<Drawer.Content contentProps={{ variant: 'left' }} class="lg:w-1/2">
					{#if data.summit_data}
						<div class="m-4 flex min-h-0 grow flex-col gap-6 overflow-y-auto">
							<div class="order-first bg-base-100">
								<Title
									summit_data={data.summit_data}
									handleClick={() => (open = false)}
									handleTarget={zoomToSummit}
								/>
							</div>
							<div class="flex grow flex-col gap-4">
								<div id="summit-wins">
									<div class="collapse collapse-arrow">
										<input type="checkbox" name="accordion-2" checked />
										<div class="collapse-title text-xl font-medium">Trophäe</div>
										<div class="collapse-content">
											{#await data.summit_wins}
												<div class="skeleton h-40 w-full"></div>
											{:then wins}
												{#if wins.length > 0}
													<Wins {wins} />
												{:else}
													<Free />
												{/if}
											{/await}
											{#await data.summit_medals then medals}
												{#if medals.length > 0}
													<div class="mt-2 border-t-2 border-base-200 pt-1">
														<Medals {medals} />
													</div>
												{/if}
											{/await}
										</div>
									</div>
								</div>
								<div id="summit-data">
									<div class="collapse collapse-arrow bg-base-200">
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
											<div class="collapse collapse-arrow mt-2 bg-base-200">
												<input type="checkbox" name="accordion-1" checked />
												<div class="collapse-title text-xl font-medium">Astige</div>
												<div class="collapse-content">
													<div class="flex flex-col gap-4">
														{#each profiles as profile}
															<div class="rounded-lg bg-base-100 p-2">
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
