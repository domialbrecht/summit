<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { SelectSummit } from '$lib/server/db/schema';
	import { CircleArrowUp, MountainSnowIcon } from 'lucide-svelte';
	const { summit, done }: { summit: SelectSummit; done: number } = $props();
</script>

<div class="md:col-span-6 xl:col-span-4">
	<a
		class={`card ${done ? 'bg-green-400' : ''} border-2 shadow-xl transition-transform hover:-translate-y-2`}
		href={`/summits/${summit.id}?reveal`}
	>
		<div class="card-body items-center justify-center">
			<Card.Title>{summit.name}</Card.Title>
			<Card.Content>
				<div class={`flex flex-col gap-2 text-lg   ${done ? 'text-white' : ''}`}>
					<div class="flex items-center gap-2">
						<MountainSnowIcon class="h-5 w-5" />
						<span>{summit.elevation} Hm</span>
					</div>
					<div class="flex items-center gap-2">
						<CircleArrowUp class="h-5 w-5" />
						<span>Cat {summit.category}</span>
					</div>
				</div>
			</Card.Content>
		</div>
	</a>
</div>
