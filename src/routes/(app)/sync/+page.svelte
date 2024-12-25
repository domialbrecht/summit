<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Section from '$lib/components/ui/section';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import { dt, hr, km } from '$lib/utils';

	const lastParse = {
		updated: page.url.searchParams.get('updated'),
		unparsed: page.url.searchParams.get('unparsed')
	};
	const { data }: { data: PageServerData } = $props();
	const attempts = Object.groupBy(
		data.attempts,
		(attempt) => attempt.summit_attempt.activityId
	) as Record<string, typeof data.attempts>;
</script>

<Section sectionId="postsync">
	{#if data.attempts.length > 0}
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
			<span class="text-primary">Nice!</span> Neui Päss ready
		</div>
		<form method="POST" action="/sync">
			<div class="mt-6 grid gap-6 xl:grid-cols-12">
				{#each Object.entries(attempts) as [activityId, entries]}
					<div class="col-span-12">
						<p class="text-xl font-bold">{attempts[activityId][0].strava_activity.name}</p>
						<div class="grid gap-4 xl:grid-cols-4">
							{#each entries as entry}
								<Card.Root>
									<Card.Body>
										<Card.Title>
											{entry.summit.name}
											<div class="badge badge-primary">NEU</div>
										</Card.Title>
										<Card.Content>
											<p>Datum: {dt(entry.strava_activity.startDate)}</p>
											<div class="card-actions justify-end">
												{#if entry.strava_activity.distance}
													<div class="badge badge-outline">
														{km(entry.strava_activity.distance)}
													</div>
												{/if}
												<div class="badge badge-outline">
													{hr(entry.strava_activity.movingTime)}
												</div>
											</div>
										</Card.Content>
									</Card.Body>
								</Card.Root>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<p class="mb-6 mt-8">
				Gseht aues guet us? Falls ja spichere dini neue Date. Falls nid nim Kontakt mit nis uf.
			</p>
			<Button type="submit">Spichere</Button>
		</form>
	{:else}
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
			<span class="text-primary">Sorry,</span> kei neui Päss
		</div>
		<p class="mb-8 mt-12">Falls was dire Mieinig nach nid stimmt, bitte nimm Kontakt mit nis uf.</p>
		<div class=""><Button href="/">Zrügg zur Homesite</Button></div>
	{/if}
	{#if lastParse.updated || lastParse.unparsed}
		<div role="alert" class="alert mt-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 shrink-0 stroke-info"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span>Testlog: {lastParse.updated} updated, {lastParse.unparsed} unparsed</span>
		</div>
	{/if}
</Section>
