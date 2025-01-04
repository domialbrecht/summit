<script lang="ts">
	import Trophy from '$site/icons/trophy.png';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { d, t } from '$lib/utils';
	import type { UserSummitWin } from '$lib/types';

	let { wins }: { wins: UserSummitWin[] } = $props();
</script>

<Card.Root variant="border" class="border-2 border-accent">
	<Card.Body>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="table">
					<tbody>
						<tr>
							<td class="w-4/12">
								<div class="flex items-center gap-3">
									<div class="avatar">
										<div class="mask mask-squircle h-12 w-12">
											<img src={Trophy} alt="Trophy" />
										</div>
									</div>
									<div>
										<div class="font-bold">{d(wins[0].winAttempt.date)}</div>
										<div class="text-sm opacity-50">{t(wins[0].winAttempt.date)}</div>
									</div>
								</div>
							</td>
							<td class="w-8/12">
								<div class="flex flex-col gap-3">
									{#each wins as win}
										<div class="flex justify-between gap-2">
											<div class="font-bold">{win.username}</div>
											<div class="flex gap-2">
												{#if win.media}
													<Dialog.Root>
														<Dialog.Trigger class="btn btn-primary btn-xs">Bild</Dialog.Trigger>
														<Dialog.Content class="w-full">
															<Dialog.Header>Passbiud</Dialog.Header>
															<img class="h-auto w-full min-w-full" src={win.media} alt="Bild" />
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
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Body>
</Card.Root>
