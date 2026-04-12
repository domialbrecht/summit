<script lang="ts">
	import type { Feature, Geometry } from 'geojson';
	import Download from 'lucide-svelte/icons/download';
	import X from 'lucide-svelte/icons/x';
	import GripVertical from 'lucide-svelte/icons/grip-vertical';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import Info from 'lucide-svelte/icons/info';
	import CircleDot from 'lucide-svelte/icons/circle-dot';
	import { fetchBRouterRoute } from '$lib/brouter-directions';

	export type RoutePoint = {
		uid: string;
		type: 'summit' | 'waypoint';
		name: string;
		lat: number;
		lng: number;
		elevation?: number;
		summitId?: number;
	};

	let {
		onclose
	}: {
		onclose: () => void;
	} = $props();

	let nextWaypointId = 0;

	// Core state
	let routePoints: RoutePoint[] = $state([]);
	let routeName = $state('Summit Route');
	let startPoint: { lat: number; lng: number } | null = $state(null);
	let settingStart = $state(false);
	let routeCoords: [number, number][] | null = $state(null);
	let routeAbort: AbortController | null = null;
	let dragIndex: number | null = $state(null);

	// Derived state for the map (exported as functions per Svelte 5 rules)
	let selectedIds = $derived(
		routePoints.filter((p) => p.type === 'summit').map((p) => p.summitId!)
	);

	let customWaypoints = $derived(
		routePoints.filter((p) => p.type === 'waypoint').map((p) => ({ lat: p.lat, lng: p.lng }))
	);

	let routeGeoJSON: GeoJSON.FeatureCollection | null = $derived(
		routeCoords
			? {
					type: 'FeatureCollection',
					features: [
						{
							type: 'Feature',
							properties: {},
							geometry: { type: 'LineString', coordinates: routeCoords }
						}
					]
				}
			: null
	);

	export function getSelectedIds() {
		return selectedIds;
	}

	export function getCustomWaypoints() {
		return customWaypoints;
	}

	export function getRouteGeoJSON() {
		return routeGeoJSON;
	}

	export function getStartPoint() {
		return startPoint;
	}

	// Drag handlers (desktop)
	function handleDragStart(idx: number) {
		dragIndex = idx;
	}

	function handleDragOver(e: DragEvent, idx: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === idx) return;
		const items = [...routePoints];
		const [moved] = items.splice(dragIndex, 1);
		items.splice(idx, 0, moved);
		routePoints = items;
		dragIndex = idx;
	}

	function handleDragEnd() {
		dragIndex = null;
	}

	// Touch reorder (mobile)
	let touchStartY = 0;
	let touchItemHeight = 0;

	function handleTouchStart(e: TouchEvent, idx: number) {
		dragIndex = idx;
		touchStartY = e.touches[0].clientY;
		const el = e.currentTarget as HTMLElement;
		touchItemHeight = el.offsetHeight;
	}

	function handleTouchMove(e: TouchEvent) {
		if (dragIndex === null) return;
		e.preventDefault();
		const y = e.touches[0].clientY;
		const diff = y - touchStartY;
		const steps = Math.round(diff / touchItemHeight);
		if (steps === 0) return;
		const targetIdx = Math.max(0, Math.min(routePoints.length - 1, dragIndex + steps));
		if (targetIdx !== dragIndex) {
			const items = [...routePoints];
			const [moved] = items.splice(dragIndex, 1);
			items.splice(targetIdx, 0, moved);
			routePoints = items;
			touchStartY += (targetIdx - dragIndex) * touchItemHeight;
			dragIndex = targetIdx;
		}
	}

	function handleTouchEnd() {
		dragIndex = null;
	}

	function removePoint(uid: string) {
		routePoints = routePoints.filter((p) => p.uid !== uid);
	}

	// Public methods called by parent
	export function handleMapClick(lngLat: { lat: number; lng: number }) {
		if (settingStart) {
			startPoint = lngLat;
			settingStart = false;
			return;
		}
		nextWaypointId++;
		routePoints = [
			...routePoints,
			{
				uid: `wp-${nextWaypointId}`,
				type: 'waypoint',
				name: `Wegpunkt ${nextWaypointId}`,
				lat: lngLat.lat,
				lng: lngLat.lng
			}
		];
	}

	export function handleSummitToggle(feature: Feature<Geometry, any>) {
		const props = feature.properties;
		const id = props.id;
		const idx = routePoints.findIndex((p) => p.type === 'summit' && p.summitId === id);
		if (idx >= 0) {
			routePoints = routePoints.filter((_, i) => i !== idx);
		} else {
			const geom = feature.geometry as { type: string; coordinates: [number, number] };
			routePoints = [
				...routePoints,
				{
					uid: `summit-${id}`,
					type: 'summit',
					name: props.name,
					elevation: props.elevation,
					lat: geom.coordinates[1],
					lng: geom.coordinates[0],
					summitId: id
				}
			];
		}
	}

	// Reactive BRouter routing
	$effect(() => {
		const waypoints: [number, number][] = [];
		if (startPoint) {
			waypoints.push([startPoint.lng, startPoint.lat]);
		}
		for (const p of routePoints) {
			waypoints.push([p.lng, p.lat]);
		}

		routeAbort?.abort();
		routeAbort = null;

		if (waypoints.length < 2) {
			routeCoords = null;
			return;
		}

		const abort = new AbortController();
		routeAbort = abort;

		fetchBRouterRoute(waypoints, 'fastbike', abort.signal)
			.then((coords) => {
				if (!abort.signal.aborted) {
					routeCoords = coords;
				}
			})
			.catch(() => {
				if (!abort.signal.aborted) {
					routeCoords = null;
				}
			});
	});

	// GPX export
	function exportGpx() {
		if (routePoints.length === 0 && !routeCoords) return;
		const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		const trkpts: string[] = [];
		if (routeCoords && routeCoords.length > 0) {
			for (const [lng, lat] of routeCoords) {
				trkpts.push(`        <trkpt lat="${lat}" lon="${lng}" />`);
			}
		} else {
			if (startPoint) {
				trkpts.push(`        <trkpt lat="${startPoint.lat}" lon="${startPoint.lng}">
          <name>Start</name>
        </trkpt>`);
			}
			for (const p of routePoints) {
				trkpts.push(`        <trkpt lat="${p.lat}" lon="${p.lng}">
          <name>${esc(p.name)}</name>${p.elevation ? `\n          <ele>${p.elevation}</ele>` : ''}
        </trkpt>`);
			}
		}

		const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Summit"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${esc(routeName)}</name>
  </metadata>
  <trk>
    <name>${esc(routeName)}</name>
    <trkseg>
${trkpts.join('\n')}
    </trkseg>
  </trk>
</gpx>`;
		const blob = new Blob([gpx], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const today = new Date().toISOString().slice(0, 10);
		const slug =
			routeName
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '') || 'summit-route';
		a.download = `${slug}-${today}.gpx`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

{#snippet panelContent()}
	<div class="flex items-center justify-between gap-2 border-b px-3 py-2">
		<span class="text-sm font-medium">{routePoints.length} usgwählt</span>
		<div class="flex gap-1">
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-sm btn-ghost btn-circle">
					<Info size={16} class="text-gray-400" />
				</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div tabindex="0" class="dropdown-content bg-base-100 z-20 w-64 rounded-lg p-3 shadow-lg">
					<p class="text-xs text-gray-600">
						Klick uf Summits zum uswähle. Klick uf d Karte zum Wegpünkt hinzfüege. D Route wird
						automatisch über Veloweg berechnet. Du chasch d Reihefolg per Drag ändere und e
						Startpunkt setze. GPX exportiere für Komoot.
					</p>
				</div>
			</div>
			<button
				onclick={exportGpx}
				disabled={routePoints.length === 0}
				class="btn btn-sm btn-primary gap-1"
			>
				<Download size={16} />
				GPX
			</button>
			<button onclick={onclose} class="btn btn-sm btn-ghost">
				<X size={16} />
			</button>
		</div>
	</div>
	<div class="border-b px-3 py-1.5">
		<input
			type="text"
			bind:value={routeName}
			placeholder="Route Name"
			class="input input-xs input-bordered w-full text-sm"
		/>
	</div>
	<div class="flex items-center gap-2 border-b px-3 py-1.5">
		<MapPin size={16} class="shrink-0 text-green-600" />
		<span class="text-xs text-gray-400">Start:</span>
		{#if startPoint}
			<span class="min-w-0 flex-1 truncate text-sm">
				{startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
			</span>
			<button
				onclick={() => (startPoint = null)}
				class="btn btn-ghost btn-xs hover:text-error text-gray-400"
			>
				<Trash2 size={14} />
			</button>
		{:else}
			<button
				onclick={() => (settingStart = true)}
				class="btn btn-primary btn-xs {settingStart ? 'text-green-600' : 'text-white'}"
			>
				{settingStart ? 'Klick uf d Karte...' : 'Setze'}
			</button>
		{/if}
	</div>
	<div class="max-h-60 overflow-y-auto">
		{#if routePoints.length === 0}
			<p class="px-3 py-4 text-center text-sm text-gray-400">
				Klick uf Summits oder d Karte zum Pünkt hinzuzfüege
			</p>
		{:else}
			{#each routePoints as point, idx (point.uid)}
				<div
					role="listitem"
					draggable="true"
					ondragstart={() => handleDragStart(idx)}
					ondragover={(e) => handleDragOver(e, idx)}
					ondragend={handleDragEnd}
					ontouchstart={(e) => handleTouchStart(e, idx)}
					ontouchmove={(e) => handleTouchMove(e)}
					ontouchend={handleTouchEnd}
					class="flex touch-none items-center gap-2 border-b border-gray-100 px-2 py-1.5 last:border-b-0
						{dragIndex === idx ? 'bg-primary/10' : 'hover:bg-gray-50'}"
				>
					<span class="cursor-grab text-gray-300 active:cursor-grabbing">
						<GripVertical size={16} />
					</span>
					<span class="text-xs text-gray-400">{idx + 1}.</span>
					{#if point.type === 'waypoint'}
						<CircleDot size={14} class="shrink-0 text-gray-400" />
					{/if}
					<span class="min-w-0 flex-1 truncate text-sm">{point.name}</span>
					{#if point.elevation}
						<span class="badge badge-sm badge-ghost">{point.elevation}m</span>
					{/if}
					<button
						onclick={() => removePoint(point.uid)}
						class="btn btn-ghost btn-xs hover:text-error text-gray-400"
					>
						<Trash2 size={14} />
					</button>
				</div>
			{/each}
		{/if}
	</div>
{/snippet}

<!-- Desktop: fixed panel -->
<div
	class="fixed top-28 right-4 z-10 hidden flex-col rounded-lg bg-white shadow-lg lg:flex lg:w-80"
>
	{@render panelContent()}
</div>

<!-- Mobile: bottom sheet (no backdrop, map stays interactive) -->
<div
	class="bg-base-100 fixed inset-x-0 bottom-0 z-10 flex max-h-[33vh] flex-col rounded-t-xl shadow-[0_-2px_10px_rgba(0,0,0,0.1)] lg:hidden"
>
	<div class="bg-base-300 mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full"></div>
	{@render panelContent()}
</div>
