<script module lang="ts">
</script>

<script lang="ts">
	import Table from './lb_table.svelte';
	import * as Card from '$lib/components/ui/card';
	import Section from '$lib/components/ui/section';
	import Gold from '$site/icons/medal1.png';
	import Silver from '$site/icons/medal2.png';
	import Bronze from '$site/icons/medal3.png';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	// let first = $derived(data.leaderboard.wins.at(0));
	// let second = $derived(data.leaderboard.wins.at(1));
	// let third = $derived(data.leaderboard.wins.at(2));
</script>

<!-- <Section sectionId="podium"> -->
<!-- 	<div class="mt-6 grid gap-x-6 gap-y-4 xl:grid-cols-12 xl:gap-y-10"> -->
<!-- 		<div class="xl:col-span-12"> -->
<!-- 			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none"> -->
<!-- 				Leaderboard -->
<!-- 			</div> -->
<!-- 		</div> -->
<!-- 		<div class="order-3 pt-4 xl:order-1 xl:col-span-4 xl:pt-10"> -->
<!-- 			<Card.Root variant="border" class="min-h-44"> -->
<!-- 				<Card.Body> -->
<!-- 					<Card.Title class="flex justify-center" -->
<!-- 						><img src={Bronze} alt="Gold" class="h-12 w-12" /></Card.Title -->
<!-- 					> -->
<!-- 					<Card.Content> -->
<!-- 						{#if third} -->
<!-- 							{third.userName} -->
<!-- 						{/if} -->
<!-- 					</Card.Content> -->
<!-- 				</Card.Body> -->
<!-- 			</Card.Root> -->
<!-- 		</div> -->
<!-- 		<div class="order-1 xl:order-2 xl:col-span-4"> -->
<!-- 			<Card.Root variant="primary" class="min-h-44"> -->
<!-- 				<Card.Body> -->
<!-- 					<Card.Title class="flex justify-center" -->
<!-- 						><img src={Gold} alt="Gold" class="h-20 w-20" /></Card.Title -->
<!-- 					> -->
<!-- 					<Card.Content> -->
<!-- 						{#if first} -->
<!-- 							{#each first as w} -->
<!-- 								{w.userName} -->
<!-- 							{/each} -->
<!-- 						{/if} -->
<!-- 					</Card.Content> -->
<!-- 				</Card.Body> -->
<!-- 			</Card.Root> -->
<!-- 		</div> -->
<!-- 		<div class="order-2 pt-4 xl:order-3 xl:col-span-4 xl:pt-10"> -->
<!-- 			<Card.Root variant="border" class="min-h-44"> -->
<!-- 				<Card.Body> -->
<!-- 					<Card.Title class="flex justify-center" -->
<!-- 						><img src={Silver} alt="Gold" class="h-12 w-12" /></Card.Title -->
<!-- 					> -->
<!-- 					<Card.Content> -->
<!-- 						{#if second} -->
<!-- 							{second.userName} -->
<!-- 						{/if} -->
<!-- 					</Card.Content> -->
<!-- 				</Card.Body> -->
<!-- 			</Card.Root> -->
<!-- 		</div> -->
<!-- 	</div> -->
<!-- </Section> -->
<Section sectionId="table">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none text-primary">
		Leaderboard
	</div>
	<div>
		<Table leaderboard={data.leaderboard} />
	</div>
</Section>
