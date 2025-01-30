<script lang="ts">
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
	<p class="mb-2 mt-2 max-w-2xl">
		Hie gsehsch aui Aktivitäte womer gsynched hei. Und die wo e Pass isch erkennt worde hei es
		"Pass" Zeiche. Falls was dire Meinig nach nid stimmt nim Kontakt uf.
	</p>
	<div class=""><Button href="/activities/me">Zrügg</Button></div>
	{#if data.summits.length > 0}
		<div class="mt-6 grid gap-6 xl:grid-cols-12">
			{#each data.summits as summit}
				<div class="xl:col-span-4">
					<a
						class="card card-bordered shadow-xl hover:bg-primary hover:text-base-100"
						href={`/summits/${summit.summit.id}`}
					>
						<div class="card-body">
							<h3 class="text-2xl font-black">{summit.summit.name}</h3>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mb-8 mt-12">Nix gfunde. Cha si das die Aktivität kei Pass het..</p>
	{/if}
</Section>
