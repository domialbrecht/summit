<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Section from '$lib/components/ui/section';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { MapLibre, GeoJSON, SymbolLayer, CircleLayer, LineLayer } from 'svelte-maplibre';
	import { Download, MountainSnow, Zap, CalendarDays, Check } from 'lucide-svelte';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	const { enhance, message } = superForm(data.joinForm, { invalidateAll: true });

	// For seasonal challenges, the current user's matched point IDs
	const myMatchedPointIds = $derived(
		data.challenge.type === 'seasonal' && data.seasonProgress
			? new Set(data.seasonProgress[data.userId] ?? [])
			: new Set<number>()
	);

	const pointsGeoJSON = $derived({
		type: 'FeatureCollection' as const,
		features: data.points.map((p, i) => ({
			type: 'Feature' as const,
			geometry: { type: 'Point' as const, coordinates: [Number(p.long), Number(p.lat)] },
			properties: {
				id: p.id,
				name: p.name ?? '',
				description: p.description ?? '',
				label: data.challenge.ordered ? String(i + 1) : (p.name ?? '')
			}
		}))
	});

	const routeGeoJSON = $derived(
		data.challenge.ordered && data.points.length > 1
			? {
					type: 'FeatureCollection' as const,
					features: [
						{
							type: 'Feature' as const,
							geometry: {
								type: 'LineString' as const,
								coordinates: data.points.map((p) => [Number(p.long), Number(p.lat)])
							},
							properties: {}
						}
					]
				}
			: null
	);

	const center = $derived(
		data.points.length > 0
			? ([Number(data.points[0].long), Number(data.points[0].lat)] as [number, number])
			: ([7.535409043530986, 47.20735710031535] as [number, number])
	);
</script>

<Section sectionId="challengeDetail">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				{data.challenge.name}
			</div>
			{#if data.challenge.description}
				<p class="text-base-content/80 mt-2 max-w-2xl">{data.challenge.description}</p>
			{/if}
			<div class="mt-2 flex gap-2">
				{#if data.challenge.type === 'seasonal'}
					<Badge variant="secondary" class="gap-1">
						<CalendarDays size={12} /> Saisonal
					</Badge>
				{:else}
					<Badge variant="outline" class="gap-1">
						<Zap size={12} /> Einmalig
					</Badge>
				{/if}
				{#if data.challenge.ordered}
					<Badge variant="outline">Festi Reihefolg</Badge>
				{/if}
			</div>
			{#if data.challenge.type === 'seasonal' && data.activeSeason}
				<p class="text-base-content/60 mt-1 text-sm">
					Saison: {data.activeSeason.name}
					{#if data.isParticipant}
						— <span class="text-primary font-semibold"
							>{myMatchedPointIds.size}/{data.points.length} Punkte</span
						>
					{/if}
				</p>
			{/if}
		</div>
		<div class="flex gap-2">
			<a href="/challenges/{data.challenge.slug}/gpx" class="btn btn-secondary btn-sm" download>
				<Download size={16} /> GPX
			</a>
			{#if !data.isParticipant}
				<form method="POST" action="?/join" use:enhance>
					<Button type="submit">Mitmache</Button>
				</form>
			{:else if !data.isCreator}
				<form method="POST" action="?/leave" use:enhance>
					<Button type="submit" variant="outline">Verlah</Button>
				</form>
			{/if}
			{#if data.isCreator}
				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => {
						if (!confirm('Challange würkli lösche? Aui Daten werded glöscht.')) e.preventDefault();
					}}
				>
					<Button type="submit" variant="error">Lösche</Button>
				</form>
			{/if}
		</div>
	</div>

	{#if $message}
		<div role="alert" class="alert mt-4">
			<span>{$message}</span>
		</div>
	{/if}

	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		<!-- Map -->
		<div class="rounded-box h-[450px] overflow-hidden xl:col-span-8">
			<MapLibre
				style="/komoot_mapstyle.json"
				standardControls
				class="h-full w-full"
				{center}
				zoom={12}
			>
				{#snippet children({ allImagesLoaded })}
					{#if routeGeoJSON}
						<GeoJSON id="challenge-route" data={routeGeoJSON}>
							<LineLayer
								id="challenge-route-line"
								layout={{ 'line-join': 'round', 'line-cap': 'round' }}
								paint={{
									'line-color': '#3abff8',
									'line-width': 3,
									'line-opacity': 0.6,
									'line-dasharray': [4, 3]
								}}
							/>
						</GeoJSON>
					{/if}
					<GeoJSON id="challenge-points" data={pointsGeoJSON}>
						<CircleLayer
							id="challenge-circles"
							paint={{
								'circle-radius': 10,
								'circle-color': '#ff5861',
								'circle-stroke-width': 2,
								'circle-stroke-color': '#ffffff'
							}}
						/>
						<SymbolLayer
							id="challenge-labels"
							layout={{
								'text-field': ['get', 'label'],
								'text-size': 13,
								'text-anchor': 'top',
								'text-offset': [0, 1.2],
								'text-font': ['Noto Sans Regular']
							}}
							paint={{
								'text-color': '#ffffff',
								'text-halo-color': 'hsl(0, 0%, 20%)',
								'text-halo-width': 1
							}}
						/>
					</GeoJSON>
				{/snippet}
			</MapLibre>
		</div>

		<!-- Points list + stats -->
		<div class="flex flex-col gap-4 xl:col-span-4">
			<Card.Root>
				<Card.Body>
					<Card.Title>Punkte ({data.points.length})</Card.Title>
					<ul class="mt-2 flex flex-col gap-2">
						{#each data.points as point, i (point.id)}
							<li class="flex flex-col gap-0.5">
								<div class="flex items-center gap-1.5">
									{#if data.challenge.ordered}
										<span class="badge badge-sm badge-neutral font-mono">{i + 1}</span>
									{/if}
									{#if data.challenge.type === 'seasonal' && data.isParticipant}
										{#if myMatchedPointIds.has(point.id)}
											<Check size={14} class="text-success shrink-0" />
										{:else}
											<span class="inline-block h-3.5 w-3.5 shrink-0"></span>
										{/if}
									{/if}
									{#if point.summitId}
										<MountainSnow size={14} class="text-primary shrink-0" />
									{/if}
									<span class="font-semibold">
										{point.name ?? `Punkt ${point.id}`}
									</span>
									{#if point.summitElevation}
										<span class="text-base-content/50 text-xs">{point.summitElevation}m</span>
									{/if}
								</div>
								{#if point.description}
									<span class="text-base-content/60 text-sm">{point.description}</span>
								{/if}
								<span class="text-base-content/40 font-mono text-xs">
									{Number(point.lat).toFixed(5)}, {Number(point.long).toFixed(5)}
								</span>
							</li>
						{/each}
					</ul>
				</Card.Body>
			</Card.Root>

			<Card.Root>
				<Card.Body>
					<Card.Title>Teilnehmer ({data.participants.length})</Card.Title>
					{#if data.participants.length === 0}
						<p class="text-base-content/60 mt-2 text-sm">No niemer bitrete.</p>
					{:else}
						<ul class="mt-2 flex flex-col gap-1">
							{#each data.participants as p (p.userId)}
								<li class="flex items-center justify-between text-sm">
									<span>{p.firstName} {p.lastName}</span>
									{#if data.challenge.type === 'seasonal' && data.seasonProgress}
										{@const userPoints = data.seasonProgress[p.userId]?.length ?? 0}
										<span class="text-base-content/50 text-xs"
											>{userPoints}/{data.points.length}</span
										>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</Card.Body>
			</Card.Root>

			{#if data.completions.length > 0}
				<Card.Root>
					<Card.Body>
						<Card.Title>Abschlüss 🏆</Card.Title>
						<ul class="mt-2 flex flex-col gap-1">
							{#each data.completions as c (c.userId)}
								<li class="text-sm">{c.firstName} {c.lastName}</li>
							{/each}
						</ul>
					</Card.Body>
				</Card.Root>
			{/if}
		</div>
	</div>
</Section>
