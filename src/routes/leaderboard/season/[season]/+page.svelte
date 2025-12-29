<script lang="ts">
	import Table from './lb_table.svelte';
	import type { PageServerData } from './$types';
	import { dt } from '$lib/utils';

	const { data }: { data: PageServerData } = $props();
</script>

<div>
	{#if data.leaderboard.attempts.length > 0}
		<Table leaderboard={data.leaderboard} />
	{:else}
		<div class="mt-4">
			<h2 class="font-title text-[clamp(1.5rem,3vw,2rem)] leading-none font-black">
				No keni Aktivitäte. D Saison {data.leaderboard.season.slug} startet am
				<span class="font-title text-primary text-[clamp(1.5rem,4vw,2rem)] leading-none font-black">
					{dt(data.leaderboard.season.startsAt)}
				</span>
			</h2>
		</div>
	{/if}
</div>
