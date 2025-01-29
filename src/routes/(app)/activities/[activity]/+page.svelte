<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Section from '$lib/components/ui/section';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	let activityName = $derived.by(() => (data.summits ? data.summits[0].strava_activity?.name : ''));
</script>

<Section sectionId="postsync">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
		<span class="text-primary">Päss uf</span>
		"{activityName}"
	</div>
	<p class="mb-2 mt-2 max-w-2xl">Hie si d Päss vo dere Aktivität. Du chasch Bilder ufelade.</p>
	<div class=""><Button href="/activities">Zrügg</Button></div>
	{#if data.summits.length > 0}
		<div class="mt-6 grid gap-6 xl:grid-cols-12">
			{#each data.summits as summit}
				<div class="xl:col-span-4">
					<Card.Root variant={'border'}>
						<Card.Body>
							<Card.Title>{summit.summit.name}</Card.Title>
							<Card.Actions>
								<Button href={`/summits/${summit.summit.id}`}>Zum Pass</Button>
							</Card.Actions>
						</Card.Body>
					</Card.Root>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mb-8 mt-12">Nix gfunde. Cha si das die Aktivität kei Pass het..</p>
	{/if}
</Section>
