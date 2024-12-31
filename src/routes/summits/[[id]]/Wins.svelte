<script lang="ts">
	import Trophy from '$site/icons/trophy.png';
	import * as Card from '$lib/components/ui/card';
	import { d, t } from '$lib/utils';
	import type { SummitWin } from '$lib/types';

	let { wins }: { wins: SummitWin[] } = $props();
</script>

<Card.Root variant="border">
	<Card.Body>
		<Card.Content>
			<div class="flex items-center justify-between gap-4">
				<div class="flex gap-4">
					{#each wins as win}
						<div class="flex items-center gap-3">
							<img src={Trophy} alt="Trophy" class="h-16 w-16" />
							<div class="avatar">
								<div class="mask mask-squircle h-12 w-12">
									<img src={win.profile} alt={win.username} />
								</div>
							</div>
							<div>
								<div class="font-bold">{win.username}</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="flex flex-col items-center">
					<span class="text-xl font-bold">{d(wins[0].winAttempt.date)}</span>
					<span class="text-xl font-bold">{t(wins[0].winAttempt.date)}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Body>
</Card.Root>
