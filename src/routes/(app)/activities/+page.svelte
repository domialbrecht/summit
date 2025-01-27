<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Section from '$lib/components/ui/section';
	import type { PageServerData } from './$types';
	import { dt, km } from '$lib/utils';

	const { data }: { data: PageServerData } = $props();
</script>

<Section sectionId="postsync">
	{#if data.activities.length > 0}
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
			<span class="text-primary">Aktivitäte</span> im System
		</div>
		<p class="mb-2 mt-2 max-w-2xl">
			Hie gsehsch aui Aktivitäte womer gsynched hei. Und die wo e Pass isch erkennt worde hei es
			"Pass erledigt" Zeiche. Falls was dire Meinig nach nid stimmt nim Kontakt uf.
		</p>
		<div class="mt-6 grid gap-6 xl:grid-cols-12">
			{#each data.activities as activity}
				<div class="xl:col-span-4">
					<a
						class={`card card-bordered border-2 shadow-xl transition-transform hover:-translate-y-2 ${activity.match ? 'border-primary' : ''}`}
						href={`/activities/${activity.id}`}
					>
						<div class="card-body">
							<h3 class="text-2xl font-black">{activity.name}</h3>
							{#if activity.match}
								<div class="badge badge-primary">Pass erledigt</div>
							{/if}
							<div class="card-content">
								<div class="card-actions mt-2">
									<div class="badge badge-outline badge-lg">{dt(activity.start)}</div>
									{#if activity.distance}
										<div class="badge badge-outline badge-lg">{km(activity.distance)}</div>
									{/if}
								</div>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
			<span class="text-primary">Nix gfunde,</span> versuech mau e sync
		</div>
		<p class="mb-8 mt-12">Falls was dire Mieinig nach nid stimmt, bitte nimm Kontakt mit nis uf.</p>
		<div class=""><Button href="/">Zrügg zur Homesite</Button></div>
	{/if}
</Section>
