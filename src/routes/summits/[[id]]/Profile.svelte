<script lang="ts">
	import type { SelectSummitProfile } from '$lib/server/db/schema';
	import Strava from '$lib/components/icons/strava.svelte';
	import ProfileChart from './ProfileChart.svelte';
	import { km, m_sign, percent, getColorFromGradient } from '$lib/utils';

	const PERFORM_SANITY_CHECK = true;

	let { profile }: { profile: Pick<SelectSummitProfile, 'name' | 'segment' | 'data'> } = $props();

	let chartData = $derived.by(() => {
		if (!profile.data) return null;
		const data = [];
		let lastElevation;
		for (let item of profile.data.split(',')) {
			const values = item.trim().split(' ');
			let next_elevation = parseFloat(values[1]);
			//sanity check
			if (PERFORM_SANITY_CHECK) {
				if (lastElevation !== undefined && next_elevation > lastElevation + 5) {
					next_elevation = (lastElevation || next_elevation) + 2;
				}
			}
			data.push([parseFloat(values[0]) * 1000, next_elevation]);
			lastElevation = next_elevation;
		}
		return data;
	});

	let distance = $derived.by(() => {
		if (chartData) {
			return chartData[chartData.length - 1][0];
		}
		return null;
	});
	let elevation = $derived.by(() => {
		if (chartData) {
			const first = chartData[0][1];
			const last = chartData[chartData.length - 1][1];
			return last - first;
		}
		return null;
	});
	let gradient = $derived.by(() => {
		if (distance && elevation) {
			return elevation / distance;
		}
		return null;
	});
</script>

<div>
	<div class="flex w-full justify-between gap-2">
		<span class="shrink">{profile.name}</span>
		{#if profile.segment}
			<a class="inline-flex shrink gap-2 text-orange-500" href={profile.segment} target="_blank">
				Segment
				<Strava class="h-6 w-6 fill-orange-500" />
			</a>
		{/if}
	</div>
	<div class="mt-2 flex w-full gap-2">
		{#if distance}
			<div class="rounded-lg bg-primary p-1 text-sm text-white">{km(distance)}</div>
		{/if}
		{#if elevation}
			<div class="rounded-lg bg-primary p-1 text-sm text-white">{m_sign(elevation)}</div>
		{/if}
		{#if gradient}
			<div
				class="rounded-lg p-1 text-sm text-black"
				style:background-color={getColorFromGradient(gradient * 100)}
			>
				{percent(gradient)}
			</div>
		{/if}
	</div>
	{#if chartData}
		<ProfileChart {chartData} />
	{/if}
</div>
