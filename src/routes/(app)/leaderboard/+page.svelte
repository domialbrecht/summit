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

	let first = $derived(data.leaderboard.at(0));
	let second = $derived(data.leaderboard.at(1));
	let third = $derived(data.leaderboard.at(2));
</script>

<Section sectionId="welcome">
	<div class="mt-6 grid gap-6 gap-y-10 xl:grid-cols-12">
		<div class="col-span-12">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				Leaderboard
			</div>
		</div>
		<div class="order-3 pt-10 xl:order-1 xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title class="flex justify-center"
						><img src={Bronze} alt="Gold" class="h-12 w-12" /></Card.Title
					>
					<Card.Content>
						{#if third}
							{third.userName}
						{/if}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="order-1 xl:order-2 xl:col-span-4">
			<Card.Root variant="primary" class="min-h-44">
				<Card.Body>
					<Card.Title class="flex justify-center"
						><img src={Gold} alt="Gold" class="h-20 w-20" /></Card.Title
					>
					<Card.Content>
						{#if first}
							{first.userName}
						{/if}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="order-2 pt-10 xl:order-3 xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title class="flex justify-center"
						><img src={Silver} alt="Gold" class="h-12 w-12" /></Card.Title
					>
					<Card.Content>
						{#if second}
							{second.userName}
						{/if}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
	</div>
</Section>
<Section sectionId="welcome">
	<div>
		<Table leaderboard={data.leaderboard} />
	</div>
</Section>
