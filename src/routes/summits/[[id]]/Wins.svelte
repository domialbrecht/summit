<script lang="ts">
	import Trophy from '$site/icons/trophy.png';
	import * as Dialog from '$lib/components/ui/dialog';
	import { d, t } from '$lib/utils';
	import type { UserSummitWin } from '$lib/types';

	let { wins }: { wins: UserSummitWin[] } = $props();
</script>

<div class="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
	<div class="flex items-center justify-between gap-3">
		<div class="avatar">
			<div class="mask mask-squircle h-6 w-6 lg:h-12 lg:w-12">
				<img src={Trophy} alt="Trophy" />
			</div>
		</div>
		<div class="flex flex-row gap-2 lg:flex-col">
			<div class="lg:text-md text-sm font-bold">{d(wins[0].winAttempt.date)}</div>
			<div class="text-sm opacity-50">{t(wins[0].winAttempt.date)}</div>
		</div>
	</div>
	<div class="flex flex-col gap-3">
		{#each wins as win}
			<div class="flex justify-between gap-2">
				<div class="font-bold">{win.username}</div>
				<div class="flex gap-2">
					{#if win.media}
						<Dialog.Root>
							<Dialog.Trigger class="btn btn-primary btn-xs">Bild</Dialog.Trigger>
							<Dialog.Content class="flex h-[95vh] w-full flex-col">
								<Dialog.Header>Passbiud</Dialog.Header>
								<div class="flex h-[90%] items-center justify-center">
									<img class="h-full w-auto" src={win.media} alt="Bild" />
								</div>
							</Dialog.Content>
						</Dialog.Root>
					{/if}
					<a
						target="_blank"
						href={`https://www.strava.com/activities/${win.winAttempt.activityId}`}
						class="btn btn-xs bg-orange-500 text-white">Aktivität</a
					>
				</div>
			</div>
		{/each}
	</div>
</div>
