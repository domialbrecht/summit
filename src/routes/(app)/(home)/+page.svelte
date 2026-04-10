<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Section from '$lib/components/ui/section';
	import Huez from '$site/huez.jpg';
	import Dizzy from '$site/icons/dizzy.png';
	import Party from '$site/icons/party.png';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { dt } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import StatsChart from './StatsChart.svelte';

	const { data }: { data: PageData; form: ActionData } = $props();

	const version = import.meta.env.VITE_APP_VERSION;

	let syncing = $state(false);

	function onSeasonChange(e: Event) {
		const slug = (e.target as HTMLSelectElement).value;
		goto(`?season=${slug}`, { invalidateAll: true });
	}
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
		<div class="xl:col-span-8">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<div class="flex items-center justify-between">
						<Card.Title>Di Fortschritt</Card.Title>
						<select
							class="select select-sm select-bordered"
							onchange={onSeasonChange}
							value={data.selectedSeasonSlug}
						>
							{#each data.seasons as s (s.slug)}
								<option value={s.slug}>{s.name}</option>
							{/each}
						</select>
					</div>
					<Card.Content>
						{#await data.leaderboardStats}
							<div class="skeleton h-72 w-full"></div>
						{:then stats}
							{#if stats.length > 0}
								<StatsChart chartData={stats} />
							{:else}
								<div class="flex h-72 items-center justify-center text-gray-400">
									<p>No keni Date für die Saison</p>
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
							{#each last_attempts as attempt, i (i)}
								<div class="flex items-center justify-between gap-4">
									<a class="link-primary" href={`/summits/${attempt.id}`}
										>{attempt.name}, {dt(attempt.date)}</a
									>
									<div class="tooltip" data-tip={`${attempt.firstName} ${attempt.lastName}`}>
										<div class="avatar">
											<div class="mask w-8 mask-circle">
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
						Alpe d’huez
						<div class="badge badge-accent">Hightlight</div>
					</Card.Title>
					<Card.Content>
						<div class="flex flex-wrap gap-4 md:flex-nowrap">
							<figure class="md:w-1/2 md:shrink-0">
								<img src={Huez} alt="Berninapss" class="h-auto w-full" />
							</figure>
							<div>
								<p>
									Das Jahr geiz ar L'Etappe ab ufd Alp. Mit Start in Le Bourg d'Oisans uf 713m radle
									mer los u näh als ersts der sehr bekannt Col de la Croix de Fer i Agriff. Herti
									24km mit durschnitt 5% Stigig!
								</p>
								<p>
									Denne geits wider ufe nid weniger legendär Col du Télégraphe, ab hie geits so
									richtig ufwerts. Drüber u gad wider ufe Col du Galibier, wo mit 2642m ü.M. der
									höchste Punkt vo de Tour isch. De fahre mer endlech Richitig Alpe d’Huez. Die 21
									Kehre no easy peasy u de simer nach <strong>170km, 5400hm</strong> am Ziel.
								</p>
								<a href="https://www.letapedutourdefrance.com/en/the-race/route"
									>https://www.letapedutourdefrance.com/en/the-race/route</a
								>
							</div>
						</div>
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-4">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title>SolyVC 2025 Story</Card.Title>
					<Card.Content>
						<a href="/story" class="btn btn-primary"> Link </a>
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
	</div>
</Section>
