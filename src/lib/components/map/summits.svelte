<script lang="ts">
	import { MapLibre, GeoJSON, SymbolLayer, type LayerClickInfo } from 'svelte-maplibre';
	import summits from '$site/paesse.json?url';
	import solyvc from '$site/solyvc.png';
	import type { Feature, Geometry } from 'geojson';
	import { goto } from '$app/navigation';

	type SummitProperty = {
		LocationID: number;
		name: string;
	};

	function handleSummitClick(e: LayerClickInfo<Feature<Geometry, SummitProperty>>) {
		const id = e.features[0].properties.LocationID;
		goto(`/summits/${id}`);
	}
</script>

<MapLibre
	style="/komoot_mapstyle.json"
	class="h-full w-full"
	images={[{ id: 'solyvc_logo', url: solyvc }]}
	center={[7.535409043530986, 47.20735710031535]}
	zoom={13}
>
	{#snippet children({ allImagesLoaded })}
		<GeoJSON id="summits" data={summits}>
			<SymbolLayer
				id="summit_symbols"
				hoverCursor="pointer"
				interactive={true}
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
						['get', 'kat'],
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
