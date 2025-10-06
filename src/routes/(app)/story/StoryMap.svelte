<script lang="ts">
	import {
		MapLibre,
		GeoJSON,
		SymbolLayer,
		RasterDEMTileSource,
		HillshadeLayer
	} from 'svelte-maplibre';
	import solyvc from '$site/solyvc.png';
	import trophy from '$site/icons/trophy.png';
	import trophyF from '$site/icons/trophyF.png';

	let { map = $bindable() } = $props();
</script>

<MapLibre
	bind:map
	style="/komoot_mapstyle.json"
	standardControls
	class="h-full w-full"
	images={[
		{ id: 'solyvc_logo', url: solyvc },
		{ id: 'attempt_icon', url: trophy },
		{ id: 'attempt_icon_female', url: trophyF }
	]}
	center={[7.535409043530986, 47.20735710031535]}
	zoom={13}
	pitch={52}
>
	{#snippet children({ allImagesLoaded })}
		<GeoJSON id="summits" data="/summits/geojson">
			<SymbolLayer
				id="summit_symbols"
				hoverCursor="pointer"
				interactive={true}
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
			<RasterDEMTileSource
				tiles={['https://tiles.swiss-map.cc/swisstopo-vector-hillshade/{z}/{x}/{y}.pbf']}
				tileSize={256}
				id="hillshadeSource"
			>
				<HillshadeLayer
					id={'hills'}
					layout={{ visibility: 'visible' }}
					paint={{
						'hillshade-exaggeration': 0.5,
						'hillshade-illumination-anchor': 'map',
						'hillshade-shadow-color': '#473B24'
					}}
				/>
			</RasterDEMTileSource>
		</GeoJSON>
	{/snippet}
</MapLibre>
