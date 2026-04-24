<script lang="ts">
	import Section from '$lib/components/ui/section';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Zap, CalendarDays } from 'lucide-svelte';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<Section sectionId="challenges">
	<div class="flex items-start justify-between">
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
			<span class="text-primary">SOLYVC</span> Challenges
		</div>
		<Button href="/challenges/new">Challange erstelle</Button>
	</div>
	<p class="pt-4 text-xl">
		Challenges si vo Mitglider erstellti Events wo du chasch mitmache um e bsunderi Herusforderig
		oder Tour z mache. Sigs aui Montis vo Locarno, die 4 höchste Päss ir Schwiz oder 5 Dead Ends. Es
		git Challenges wo du d Checkpoints i eire Route erledige muesch, oder serigi wos drum geit die
		ire Saison abzschliesse.
	</p>

	{#if data.challenges.length === 0}
		<p class="text-base-content/60 mt-12">No kei Challanges. Ersteu du die ersti!</p>
	{:else}
		<div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.challenges as challenge (challenge.id)}
				<a href="/challenges/{challenge.slug}" class="block">
					<Card.Root class="hover:bg-base-200 h-full transition-colors">
						<Card.Body>
							<Card.Title>{challenge.name}</Card.Title>
							{#if challenge.description}
								<p class="text-base-content/70 line-clamp-2 text-sm">{challenge.description}</p>
							{/if}
							<div class="mt-3 flex flex-wrap gap-2">
								{#if challenge.type === 'seasonal'}
									<Badge variant="secondary" class="gap-1">
										<CalendarDays size={12} /> Saisonal
									</Badge>
								{:else}
									<Badge variant="outline" class="gap-1">
										<Zap size={12} /> Einmalig
									</Badge>
								{/if}
								<Badge variant="outline"
									>{challenge.pointCount} Punkt{challenge.pointCount !== 1 ? 'e' : ''}</Badge
								>
								<Badge variant="outline">{challenge.participantCount} Teilnehmer</Badge>
								{#if challenge.completionCount > 0}
									<Badge>{challenge.completionCount} Abschlüss</Badge>
								{/if}
							</div>
							<p class="text-base-content/60 mt-2 text-sm">
								Von {challenge.creatorFirstName}
								{challenge.creatorLastName}
							</p>
						</Card.Body>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</Section>
