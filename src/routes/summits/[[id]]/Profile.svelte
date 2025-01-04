<script lang="ts">
	import type { SelectSummitProfile } from '$lib/server/db/schema';
	import Strava from '$lib/components/icons/strava.svelte';
	import ProfileChart from './ProfileChart.svelte';
	import { km, m_sign, percent, getColorFromGradient } from '$lib/utils';

	let { profile }: { profile: Pick<SelectSummitProfile, 'name' | 'segment' | 'data'> } = $props();

	let chartData = $derived.by(() => {
		if (!profile.data) return null;
		return profile.data.split(',').map((item) => {
			const values = item.trim().split(' ');
			return [parseFloat(values[0]) * 1000, parseFloat(values[1])];
		});
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
	<div class="flex justify-between gap-4">
		<div class="flex flex-col items-center justify-between gap-2 lg:flex-row lg:gap-4">
			<span>{profile.name}</span>
			<div class="flex gap-2">
				{#if distance}
					<div class="badge badge-primary">{km(distance)}</div>
				{/if}
				{#if elevation}
					<div class="badge badge-primary">{m_sign(elevation)}</div>
				{/if}
				{#if gradient}
					<div
						class="badge text-black"
						style:background-color={getColorFromGradient(gradient * 100)}
					>
						{percent(gradient)}
					</div>
				{/if}
			</div>
		</div>
		<a class="inline-flex gap-2 text-orange-500" href={profile.segment} target="_blank">
			Segment
			<Strava class="h-6 w-6 fill-orange-500" />
		</a>
	</div>
	{#if chartData}
		<ProfileChart {chartData} />
	{/if}
</div>
