<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Section from '$lib/components/ui/section';
	import Bernina from '$site/bernina.jpg';
	import Dizzy from '$site/icons/dizzy.png';
	import Party from '$site/icons/party.png';
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
		<div class="flex items-center gap-4 xl:col-span-12">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				Hey, <span class="text-primary">{data.user?.firstName}</span>
			</div>
			<div class="">
				<a
					class="btn btn-sm btn-primary rounded-full font-mono font-light"
					href="/news"
					rel="nofollow"><pre><code>Neus in Version {version}!</code></pre></a
				>
			</div>
		</div>
		<div class="xl:col-span-5">
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
								<Card.Actions class="mt-2 justify-center">
									<Button href={`/users/${data.user.id}`}>Aui</Button>
								</Card.Actions>
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
					<Card.Title>Dini Aktivitäte</Card.Title>
					<Card.Content>
						<Button href="/activities/me">Link</Button>
						<Button variant="secondary" href="/report">Manuell erstelle</Button>
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
		<div class="xl:col-span-12">
			<Card.Root class="bg-base-content hover:bg-primary min-h-44">
				<a
					href="/story"
					class="flex h-full w-full grow cursor-pointer items-center justify-center text-white"
				>
					<p class="text-4xl font-extrabold">Dini SolyVC Summit Story</p>
				</a>
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
								<div class="flex items-center justify-between gap-4">
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
							<Card.Actions class="mt-2 justify-center">
								<Button href="/activities">Aui</Button>
							</Card.Actions>
						{/await}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-8">
			<Card.Root variant="sideResponsive">
				<Card.Body>
					<Card.Title>
						Berninapass
						<div class="badge badge-accent">Hightlight</div>
					</Card.Title>
					<Card.Content>
						<div class="flex flex-wrap gap-4 md:flex-nowrap">
							<figure class="md:w-1/2 md:shrink-0">
								<img src={Bernina} alt="Berninapss" class="h-auto w-full" />
							</figure>
							<p>
								Der Berninapass bildet - gestützt auf zahlreiche Funde wie steinzeitliche Menhire
								mit rätselhaften Ritzzeichnungen etc. - eine jahrtausendalte Verbindung zwischen dem
								Oberengadin und dem Puschlav bis ins Veltlin. Der Berninapass war, im Gegensatz zu
								Splügen oder Septimer, nie eine alpenquerende Transitroute, die eine europäische
								Bedeutung erlangt hätte. Erst die politische Entwicklung zu Beginn der Neuzeit
								(Anfangs des 16. Jh) förderte die Bedeutung.
							</p>
						</div>
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
	</div>
</Section>
