<script lang="ts">
	import Section from '$lib/components/ui/section';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<Section sectionId="clubs">
	<div class="flex items-start justify-between">
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
			My <span class="text-primary">Clubs</span>
		</div>
		<Button href="/clubs/new">Club registriere</Button>
	</div>

	{#if data.clubs.length === 0}
		<p class="text-base-content/60 mt-12">Du bisch no i keim Club. Registrier din Strava Club!</p>
	{:else}
		<div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.clubs as { club, role } (club.id)}
				<a href="/clubs/{club.slug}" class="block">
					<Card.Root class="hover:bg-base-200 h-full transition-colors">
						<Card.Body>
							<div class="flex items-center gap-3">
								{#if club.profileImageUrl}
									<img src={club.profileImageUrl} alt={club.name} class="h-10 w-10 rounded-full" />
								{/if}
								<div>
									<Card.Title>{club.name}</Card.Title>
									<Badge variant="outline" class="mt-1">{role}</Badge>
								</div>
							</div>
							{#if club.description}
								<p class="text-base-content/60 mt-2 line-clamp-2 text-sm">
									{club.description}
								</p>
							{/if}
						</Card.Body>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</Section>
