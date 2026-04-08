<script lang="ts">
	import {
		MapLibre,
		GeoJSON,
		CircleLayer,
		SymbolLayer,
		type LayerClickInfo
	} from 'svelte-maplibre';
	import { type Map, type MapMouseEvent } from 'maplibre-gl';
	import { CHALLENGE_COLORS as COLORS } from './challenge-colors';
	import solyvc from '$site/solyvc.png';

	export type EditorMode = 'drag' | 'select' | 'place';

	type Point = {
		lat: number;
		long: number;
		name: string;
		description: string;
		summitId?: number;
	};

	let {
		points = $bindable<Point[]>([]),
		selectedIndex = $bindable<number | null>(null),
		mode = $bindable<EditorMode>('place'),
		flyToTarget,
		onPointAdded,
		onSummitSelected
	}: {
		points: Point[];
		selectedIndex: number | null;
		mode: EditorMode;
		flyToTarget: { lat: number; long: number } | null;
		onPointAdded: (p: { lat: number; long: number }) => void;
		onSummitSelected?: (s: {
			summitId: number;
			name: string;
			lat: number;
			long: number;
			elevation: number | null;
		}) => void;
	} = $props();

	let map = $state<Map | undefined>(undefined);

	// Reactive flyTo
	$effect(() => {
		if (!map || !flyToTarget) return;
		map.flyTo({
			center: [flyToTarget.long, flyToTarget.lat],
			zoom: Math.max(map.getZoom(), 14),
			speed: 1.4
		});
	});

	function handleMapClick(e: MapMouseEvent) {
		if (mode !== 'place') return;
		const { lng, lat } = e.lngLat;
		onPointAdded({ lat, long: lng });
	}

	function handleCircleClick(e: LayerClickInfo) {
		const idx = e.features?.[0]?.properties?.idx;
		if (idx !== null && idx !== undefined) selectedIndex = Number(idx);
	}

	function handleSummitClick(e: LayerClickInfo) {
		if (mode !== 'select' || !onSummitSelected) return;
		const props = e.features?.[0]?.properties;
		if (!props) return;
		const geom = e.features?.[0]?.geometry;
		if (!geom || geom.type !== 'Point') return;
		const [lng, lat] = geom.coordinates;
		onSummitSelected({
			summitId: props.id,
			name: props.name,
			lat,
			long: lng,
			elevation: props.elevation ?? null
		});
	}

	const pointsGeoJSON = $derived({
		type: 'FeatureCollection' as const,
		features: points.map((p, i) => ({
			type: 'Feature' as const,
			geometry: { type: 'Point' as const, coordinates: [p.long, p.lat] },
			properties: {
				idx: i,
				color: COLORS[i % COLORS.length],
				label: p.name || String(i + 1)
			}
		}))
	});

	const selectedIdx = $derived(selectedIndex ?? -1);
	const summitCursor = $derived(mode === 'select' ? 'pointer' : undefined);
</script>

<div class="h-full w-full" class:cursor-crosshair={mode === 'place'}>
	<MapLibre
		bind:map
		style="/komoot_mapstyle.json"
		standardControls
		class="h-full w-full"
		images={[{ id: 'solyvc_logo', url: solyvc }]}
		center={[7.535409043530986, 47.20735710031535]}
		zoom={12}
		onclick={handleMapClick}
	>
		{#snippet children()}
			<GeoJSON id="summits" data="/summits/geojson">
				<SymbolLayer
					id="summit_symbols"
					interactive={mode === 'select'}
					hoverCursor={summitCursor}
					onclick={handleSummitClick}
					layout={{
						'text-field': ['to-string', ['get', 'name']],
						'text-size': 12,
						'icon-size': 0.06,
						'text-anchor': 'top',
						'text-offset': [0, 1.2],
						'text-font': ['Noto Sans Regular'],
						'icon-image': 'solyvc_logo'
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
							'#aaaaaa'
						],
						'text-halo-color': 'hsl(0, 0%, 30%)',
						'text-halo-width': 1,
						'text-opacity': mode === 'select' ? 1 : 0.5,
						'icon-opacity': mode === 'select' ? 1 : 0.4
					}}
				/>
			</GeoJSON>

			<GeoJSON id="editor-points" data={pointsGeoJSON}>
				<CircleLayer
					id="editor-circles"
					interactive
					hoverCursor="pointer"
					onclick={handleCircleClick}
					paint={{
						'circle-radius': ['case', ['==', ['get', 'idx'], selectedIdx], 11, 9],
						'circle-color': ['get', 'color'],
						'circle-stroke-width': ['case', ['==', ['get', 'idx'], selectedIdx], 3, 2],
						'circle-stroke-color': 'white'
					}}
				/>
				<SymbolLayer
					id="editor-labels"
					layout={{
						'text-field': ['get', 'label'],
						'text-size': 11,
						'text-anchor': 'bottom',
						'text-offset': [0, -1.5],
						'text-font': ['Noto Sans Regular']
					}}
					paint={{
						'text-color': 'white',
						'text-halo-color': 'rgba(0,0,0,0.8)',
						'text-halo-width': 1
					}}
				/>
			</GeoJSON>
		{/snippet}
	</MapLibre>
</div>
