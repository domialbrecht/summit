<script lang="ts">
	import {
		MapLibre,
		GeoJSON,
		SymbolLayer,
		CircleLayer,
		LineLayer,
		Marker,
		type LayerClickInfo
	} from 'svelte-maplibre';
	import type { ExpressionSpecification } from 'maplibre-gl';
	import solyvc from '$site/solyvc.png';
	import trophy from '$site/icons/trophy.png';
	import trophyF from '$site/icons/trophyF.png';
	import type { Feature, Geometry } from 'geojson';
	import { goto } from '$app/navigation';

	type SummitProperty = {
		id: number;
		name: string;
		elevation: number;
		category: number;
		desc: string;
	};

	function handleSummitClick(e: LayerClickInfo<Feature<Geometry, SummitProperty>>) {
		const feature = e.features[0];
		const id = feature.properties.id;

		if (selectionMode) {
			onSummitToggle?.(feature);
			return;
		}

		goto(`/summits/${id}`);
		handleClick();
	}

	let {
		map = $bindable(),
		handleClick,
		mapUrl,
		selectionMode = false,
		selectedIds = [],
		onSummitToggle,
		onMapClick,
		startPoint = null,
		routeGeoJSON = null,
		customWaypoints = []
	}: {
		map?: maplibregl.Map;
		handleClick: () => void;
		mapUrl: string;
		selectionMode?: boolean;
		selectedIds?: number[];
		onSummitToggle?: (feature: Feature<Geometry, SummitProperty>) => void;
		onMapClick?: (lngLat: { lat: number; lng: number }) => void;
		startPoint?: { lat: number; lng: number } | null;
		routeGeoJSON?: GeoJSON.FeatureCollection | null;
		customWaypoints?: { lat: number; lng: number }[];
	} = $props();

	let selectedFilter: ExpressionSpecification = $derived(
		selectedIds.length > 0
			? (['in', ['get', 'id'], ['literal', selectedIds]] as ExpressionSpecification)
			: (['==', ['get', 'id'], -1] as ExpressionSpecification)
	);
</script>

<MapLibre
	bind:map
	style="/komoot_mapstyle.json"
	standardControls
	class="h-full w-full {selectionMode ? 'cursor-crosshair' : ''}"
	images={[
		{ id: 'solyvc_logo', url: solyvc },
		{ id: 'attempt_icon', url: trophy },
		{ id: 'attempt_icon_female', url: trophyF }
	]}
	center={[7.535409043530986, 47.20735710031535]}
	zoom={13}
	onclick={(e) => {
		if (onMapClick && map) {
			const features = map.queryRenderedFeatures(e.point, { layers: ['summit_symbols'] });
			if (features.length === 0) {
				onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
			}
		}
	}}
>
	{#snippet children({ allImagesLoaded })}
		{#if routeGeoJSON}
			<GeoJSON id="summit-route" data={routeGeoJSON}>
				<LineLayer
					id="summit-route-line-casing"
					layout={{ 'line-join': 'round', 'line-cap': 'round' }}
					paint={{
						'line-color': '#ffffff',
						'line-width': 6,
						'line-opacity': 0.8
					}}
				/>
				<LineLayer
					id="summit-route-line"
					layout={{ 'line-join': 'round', 'line-cap': 'round' }}
					paint={{
						'line-color': '#e5384e',
						'line-width': 3,
						'line-opacity': 0.85
					}}
				/>
			</GeoJSON>
		{/if}
		{#if selectionMode}
			<GeoJSON id="summits-selection" data={mapUrl}>
				<CircleLayer
					id="summit_selection_highlight"
					filter={selectedFilter}
					paint={{
						'circle-radius': 18,
						'circle-color': 'transparent',
						'circle-stroke-width': 2.5,
						'circle-stroke-color': '#ffffff'
					}}
				/>
			</GeoJSON>
		{/if}
		<GeoJSON id="summits" data={mapUrl}>
			<SymbolLayer
				id="summit_symbols"
				hoverCursor="pointer"
				interactive={true}
				onclick={handleSummitClick}
				layout={{
					'text-field': ['to-string', ['get', 'name']],
					'text-size': 14,
					'icon-size': [
						'case',
						['any', ['has', 'attempts'], ['boolean', ['get', 'attempts'], false]],
						0.1, // Use this icon if true
						0.06 // Default icon
					],
					'text-anchor': 'top',
					'text-offset': [0, 1.2],
					'text-font': ['Noto Sans Regular'],
					'icon-image': [
						'case',
						['any', ['has', 'attempts'], ['boolean', ['get', 'attempts'], false]],
						'attempt_icon', // Default attempt icon if attempts exist
						'solyvc_logo' // Default icon if no attempts
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
		{#if startPoint}
			<Marker lngLat={[startPoint.lng, startPoint.lat]}>
				<div class="h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-md"></div>
			</Marker>
		{/if}
		{#each customWaypoints as wp}
			<Marker lngLat={[wp.lng, wp.lat]}>
				<div class="h-3 w-3 rounded-full border-2 border-white bg-gray-500 shadow-md"></div>
			</Marker>
		{/each}
	{/snippet}
</MapLibre>
