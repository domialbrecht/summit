<script lang="ts">
	import {
		Control,
		ControlGroup,
		ControlButton,
		MapLibre,
		GeoJSON,
		MapEvents,
		SymbolLayer,
		type LayerClickInfo,
		DefaultMarker,
		Marker
	} from 'svelte-maplibre';
	import type maplibregl from 'maplibre-gl';
	import solyvc from '$site/solyvc.png';
	import trophy from '$site/icons/trophy.png';
	import type { Feature, Geometry } from 'geojson';
	import type { LngLat, MapMouseEvent } from 'maplibre-gl';
	import { Pencil, CirclePlus } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	type SummitProperty = {
		id: number;
		name: string;
		elevation: number;
		category: number;
		desc: string;
	};

	let {
		handleClick,
		markers
	}: { handleClick: (e: LngLat | null) => void; markers: { lngLat: LngLat }[] } = $props();
	let addMode = $state(false);
	let map: maplibregl.Map | undefined = $state();

	$effect(() => {
		if (map) {
			map.getCanvas().style.cursor = addMode ? 'crosshair' : 'grab';
		}
	});

	function handleSummitClick(e: LayerClickInfo<Feature<Geometry, SummitProperty>>) {
		if (addMode) return;
		const id = e.features[0].properties.id;
		goto(`/admin/summits/${id}`);
		handleClick(null);
	}

	function handleMapClick(e: MapMouseEvent) {
		if (!addMode) return;
		goto(`/admin/summits`);

		if (map) {
			map.flyTo({ center: e.lngLat });
			map.once('moveend', () => {
				const c = map?.getContainer();
				map?.panBy([c ? -(c.offsetWidth / 4) : 0, 0]);
				handleClick(e.lngLat);
			});
		}
	}
</script>

<MapLibre
	bind:map
	style="/komoot_mapstyle.json"
	class="h-full w-full"
	images={[
		{ id: 'solyvc_logo', url: solyvc },
		{ id: 'attempt_icon', url: trophy }
	]}
	center={[7.535409043530986, 47.20735710031535]}
	zoom={13}
>
	{#snippet children()}
		<MapEvents onclick={handleMapClick} />
		{#each markers as marker}
			<Marker lngLat={marker.lngLat} class="h-4 w-4 rounded-full bg-primary" />
		{/each}
		<Control position="bottom-right" class="flex flex-col gap-y-2">
			<ControlGroup>
				<ControlButton
					class={`p-1 ${!addMode ? 'bg-slate-200' : ''}`}
					onclick={() => (addMode = false)}><Pencil class="h-4 w-4" /></ControlButton
				>
				<ControlButton
					class={`p-1 ${addMode ? 'bg-slate-200' : ''}`}
					onclick={() => (addMode = true)}><CirclePlus class="h-4 w-4" /></ControlButton
				>
			</ControlGroup>
		</Control>
		<GeoJSON id="summits" data="/summits/geojson">
			<SymbolLayer
				id="summit_symbols"
				hoverCursor="pointer"
				interactive={true}
				onclick={handleSummitClick}
				layout={{
					'text-field': ['to-string', ['get', 'name']],
					'text-size': 12,
					'icon-size': [
						'case',
						['==', ['get', 'attempt'], true], // Check if 'attempt' is true
						0.1, // Use this icon if true
						0.06 // Default icon
					],
					'text-anchor': 'top',
					'text-offset': [0, 1.2],
					'text-font': ['Noto Sans Regular'],
					'icon-image': [
						'case',
						['==', ['get', 'attempt'], true], // Check if 'attempt' is true
						'attempt_icon', // Use this icon if true
						'solyvc_logo' // Default icon
					]
				}}
				paint={{
					'text-color': [
						'match',
						['get', 'category'],
						[1],
						'#86efac',
						[2],
						'#00d7c0',
						[3],
						'#00b6ff',
						[4],
						'#ffbe00',
						[5],
						'#ff5861',
						'#000000'
					],
					'text-halo-color': 'hsl(0, 0%, 30%)',
					'text-halo-width': 1
				}}
			/>
		</GeoJSON>
	{/snippet}
</MapLibre>
