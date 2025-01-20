<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Section from '$lib/components/ui/section';
	import Tremola from '$site/tremola.jpg';
	import Dizzy from '$site/icons/dizzy.png';
	import Party from '$site/icons/party.png';
	import Bicycle from '$site/icons/bicycle.png';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { dt } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';

	const { data }: { data: PageData; form: ActionData } = $props();

	const version = import.meta.env.VITE_APP_VERSION;

	let syncing = $state(false);
</script>

<Section sectionId="welcome">
	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		<div class="xl:col-span-12">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				Hey, <span class="text-primary">{data.user?.firstName}</span>
			</div>
		</div>
		<div class="xl:col-span-12">
			<div class="flex flex-row items-center gap-4 xl:items-center xl:gap-6">
				<div>
					<button class="btn btn-sm rounded-full font-mono font-light"
						><pre><code>Beta Version {version}</code></pre></button
					>
				</div>
				<div class="flex w-full max-w-48 grow gap-2 max-lg:my-4 sm:max-w-sm">
					<a
						class="tooltip tooltip-accent relative flex w-full flex-col"
						href="https://trello.com/invite/b/676877314cec746b00490b2c/ATTIb94d4fda688120db48b9eb3e6882f973C3FC143F/solyvc-summits"
						target="_blank"
						rel="nofollow"
						data-tip="Zum Projektplan"
						><div
							class="absolute -top-4 -translate-x-1/2 text-[0.6rem] italic rtl:translate-x-1/2"
							style="inset-inline-start:79%"
						>
							95%
						</div>
						<progress
							class="progress progress-accent w-full border border-base-200 bg-base-200"
							max="100"
							value="95"
						></progress>
						<div class="absolute -bottom-4 text-[0.6rem] italic tracking-wide">
							Aktuelle Fortschritt zu 1.0
						</div></a
					>
				</div>
				<!---->
			</div>
		</div>
		<div class="xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title>Di letzt Pass</Card.Title>
					<Card.Content>
						{#await data.last_attempt}
							<div class="skeleton h-32 w-full"></div>
						{:then last_attempt}
							{#if last_attempt}
								<div class="flex items-center gap-4">
									<img src={Party} class="h-8 w-8" alt="Party" />
									<a class="link-primary" href={`/summits/${last_attempt.summit.id}`}
										>{last_attempt.summit.name}, {dt(last_attempt.summit_attempt.date)}</a
									>
								</div>
							{:else}
								<div class="flex items-center gap-4">
									<img src={Dizzy} class="h-8 w-8" alt="Dizzy" />
									<p>Leider no kene gfunde..</p>
								</div>
							{/if}
						{/await}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title>Club Aktivitäte</Card.Title>
					<Card.Content>
						{#await data.last_attempts}
							<div class="skeleton h-32 w-full"></div>
						{:then last_attempts}
							{#each last_attempts as attempt}
								<div class="flex items-center gap-4">
									<a class="link-primary" href={`/summits/${attempt.id}`}
										>{attempt.name}, {dt(attempt.date)}</a
									>
									<div class="tooltip" data-tip={`${attempt.firstName} ${attempt.lastName}`}>
										<div class="avatar">
											<div class="mask mask-circle w-8">
												<img
													loading="lazy"
													class="pointer-events-none transition-all duration-500 ease-in-out"
													alt={attempt.firstName}
													src={attempt.profile}
												/>
											</div>
										</div>
									</div>
								</div>
							{/each}
						{/await}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-3">
			<Card.Root class="min-h-44" variant={syncing ? 'info' : 'primary'}>
				<Card.Body>
					<Card.Title>Aktualisier dini Date</Card.Title>
					<Card.Content>
						{#if !syncing}
							<form
								action="?/sync"
								method="POST"
								use:enhance={() => {
									syncing = true;
									return async ({ update }) => {
										await update();
										syncing = false;
									};
								}}
							>
								<button disabled={syncing} class="btn btn-secondary"> Synchronisiere </button>
							</form>
						{:else}
							<div class="flex items-center justify-center">
								<progress class="progress w-full"></progress>
							</div>
						{/if}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-8">
			<Card.Root variant="sideResponsive">
				<figure class="grow">
					<img src={Tremola} alt="Tremola" class="h-full" />
				</figure>
				<Card.Body>
					<Card.Title>
						Tremola
						<div class="badge badge-accent">Hightlight</div>
					</Card.Title>
					<Card.Content>
						Die Tremola ist eine der schönsten und abenteuerlichsten Strassen für passionierte
						Zweiradfahrer. Sie wurde Anfang des 19. Jahrhunderts erbaut und zwischen 1937 und 1941
						durch einen Belag mit Hundertausenden von Granitsteinen ersetzt. Sie windet sich mit 24
						Kehren von Airolo hinauf zum 2106 Meter hohen Gotthardpass.
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title>Dini Aktivitäte</Card.Title>
					<Card.Content>
						<Button href="/activities">Link</Button>
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
	</div>
</Section>
