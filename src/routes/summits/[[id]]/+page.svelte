<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import type { Feature, Geometry } from 'geojson';
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
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Crosshair from 'lucide-svelte/icons/crosshair';
	import Download from 'lucide-svelte/icons/download';
	import X from 'lucide-svelte/icons/x';
	import GripVertical from 'lucide-svelte/icons/grip-vertical';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';

	type SelectedSummit = {
		id: number;
		name: string;
		elevation: number;
		lat: number;
		lng: number;
	};

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;

	let activeSummit = $derived(data.summit_data ? data.summit_data.summit : null);
	let open = $state(false);

	let showSeasonOnly = $state(true);
	let refreshTimestamp = $state(Date.now());
	let isRefreshing = $state(false);
	let mapUrl = $derived(
		`${showSeasonOnly ? '/summits/geojson?season=active' : '/summits/geojson'}&t=${refreshTimestamp}`
	);

	let mapComp: maplibregl.Map | undefined = $state();

	// Selection mode state
	let selectionMode = $state(false);
	let selectedSummits: SelectedSummit[] = $state([]);
	let selectedIds = $derived(selectedSummits.map((s) => s.id));

	// Drag-to-reorder state
	let dragIndex: number | null = $state(null);

	function handleDragStart(idx: number) {
		dragIndex = idx;
	}

	function handleDragOver(e: DragEvent, idx: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === idx) return;
		const items = [...selectedSummits];
		const [moved] = items.splice(dragIndex, 1);
		items.splice(idx, 0, moved);
		selectedSummits = items;
		dragIndex = idx;
	}

	function handleDragEnd() {
		dragIndex = null;
	}

	function removeSummit(id: number) {
		selectedSummits = selectedSummits.filter((s) => s.id !== id);
	}

	function toggleSelectionMode() {
		selectionMode = !selectionMode;
		if (!selectionMode) {
			selectedSummits = [];
		}
	}

	function handleSummitToggle(feature: Feature<Geometry, any>) {
		const props = feature.properties;
		const id = props.id;
		const idx = selectedSummits.findIndex((s) => s.id === id);
		if (idx >= 0) {
			selectedSummits = selectedSummits.filter((s) => s.id !== id);
		} else {
			const geom = feature.geometry as { type: string; coordinates: [number, number] };
			selectedSummits = [
				...selectedSummits,
				{
					id,
					name: props.name,
					elevation: props.elevation,
					lat: geom.coordinates[1],
					lng: geom.coordinates[0]
				}
			];
		}
	}

	function exportGpx() {
		if (selectedSummits.length === 0) return;
		const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		const wpts = selectedSummits
			.map(
				(s) => `  <wpt lat="${s.lat}" lon="${s.lng}">
    <name>${esc(s.name)}</name>
    <ele>${s.elevation}</ele>
  </wpt>`
			)
			.join('\n');
		const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Summit"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Summit Selection</name>
  </metadata>
${wpts}
</gpx>`;
		const blob = new Blob([gpx], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const today = new Date().toISOString().slice(0, 10);
		a.download = `summits-${selectedSummits.length}-${today}.gpx`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleRefresh() {
		isRefreshing = true;
		refreshTimestamp = Date.now();
		setTimeout(() => {
			isRefreshing = false;
		}, 1000);
	}

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
						<button
							onclick={toggleSelectionMode}
							class="btn btn-circle btn-sm shadow-lg {selectionMode
								? 'btn-primary'
								: 'bg-white text-gray-700 hover:bg-gray-100'}"
							aria-label="Toggle selection mode"
							title="Summits uswähle für GPX Export"
						>
							<Crosshair size={20} />
						</button>
						<button
							onclick={handleRefresh}
							disabled={isRefreshing}
							class="btn btn-circle btn-sm bg-white text-gray-700 shadow-lg hover:bg-gray-100"
							aria-label="Refresh map data"
						>
							{#if isRefreshing}
								<Loader2 class="animate-spin" size={20} />
							{:else}
								<RefreshCw size={20} />
							{/if}
						</button>
					</div>
				</div>
				{#if selectionMode}
					<div
						class="fixed right-2 bottom-24 left-2 z-10 flex flex-col rounded-lg bg-white shadow-lg lg:top-28 lg:right-4 lg:bottom-auto lg:left-auto lg:w-80"
					>
						<div class="flex items-center justify-between gap-2 border-b px-3 py-2">
							<span class="text-sm font-medium">{selectedSummits.length} usgwählt</span>
							<div class="flex gap-1">
								<button
									onclick={exportGpx}
									disabled={selectedSummits.length === 0}
									class="btn btn-sm btn-primary gap-1"
								>
									<Download size={16} />
									GPX
								</button>
								<button onclick={toggleSelectionMode} class="btn btn-sm btn-ghost">
									<X size={16} />
								</button>
							</div>
						</div>
						<div class="max-h-60 overflow-y-auto">
							{#if selectedSummits.length === 0}
								<p class="px-3 py-4 text-center text-sm text-gray-400">
									Klick uf d Karte zum Summits uswähle
								</p>
							{:else}
								{#each selectedSummits as summit, idx (summit.id)}
									<div
										role="listitem"
										draggable="true"
										ondragstart={() => handleDragStart(idx)}
										ondragover={(e) => handleDragOver(e, idx)}
										ondragend={handleDragEnd}
										class="flex items-center gap-2 border-b border-gray-100 px-2 py-1.5 last:border-b-0
											{dragIndex === idx ? 'bg-primary/10' : 'hover:bg-gray-50'}"
									>
										<span class="cursor-grab text-gray-300 active:cursor-grabbing">
											<GripVertical size={16} />
										</span>
										<span class="text-xs text-gray-400">{idx + 1}.</span>
										<span class="min-w-0 flex-1 truncate text-sm">{summit.name}</span>
										<span class="badge badge-sm badge-ghost">{summit.elevation}m</span>
										<button
											onclick={() => removeSummit(summit.id)}
											class="btn btn-ghost btn-xs hover:text-error text-gray-400"
										>
											<Trash2 size={14} />
										</button>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
				<SummitMap
					bind:map={mapComp}
					handleClick={() => (open = true)}
					{mapUrl}
					{selectionMode}
					{selectedIds}
					onSummitToggle={handleSummitToggle}
				/>
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
