<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Section from '$lib/components/ui/section';
	import Furka from '$site/furka.jpg?enhanced';
	import Dizzy from '$site/icons/dizzy.png';
	import Party from '$site/icons/party.png';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	const version = import.meta.env.VITE_APP_VERSION;

	let syncing = $state(false);
</script>

<Section sectionId="welcome">
	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		<div class="col-span-12">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				Hey, <span class="text-primary">{data.user?.firstName}</span>
			</div>
		</div>
		<div class="col-span-12">
			<div class="flex flex-col items-center gap-6 xl:flex-row">
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
							65%
						</div>
						<progress
							class="progress progress-accent w-full border border-base-200 bg-base-200"
							max="100"
							value="79"
						></progress>
						<div class="absolute -bottom-4 text-[0.6rem] italic tracking-wide">
							Aktuelle Fortschritt zu 1.0
						</div></a
					>
				</div>
				<!---->
			</div>
		</div>
		<div class="xl:col-span-7">
			<Card.Root variant="border" class="min-h-44">
				<Card.Body>
					<Card.Title>Di letzt Pass</Card.Title>
					<Card.Content>
						{#if data.last_attempt}
							<div class="flex items-center gap-4">
								<img src={Party} class="h-8 w-8" alt="Party" />
								<p>{data.last_attempt.summit.name}, {data.last_attempt.summit_attempt.date}</p>
							</div>
						{:else}
							<div class="flex items-center gap-4">
								<img src={Dizzy} class="h-8 w-8" alt="Dizzy" />
								<p>Leider no kene gfunde..</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-5">
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
								{#if form?.message}
									<div class="mb-4">
										<div class="badge badge-secondary">{form.message.updated} neui Aktivitäte</div>
										<div class="badge badge-secondary">{form.message.unparsed} Verarbeitet</div>
										<div class="badge badge-secondary">{form.message.attempts} Päss</div>
									</div>
									<a href="/activities" class="btn btn-secondary"> Aktivitäte checke </a>
								{:else}
									<button disabled={syncing} class="btn btn-secondary"> Synchronisiere </button>
								{/if}
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
		<div class="xl:col-span-10">
			<Card.Root variant="sideResponsive">
				<figure>
					<enhanced:img src={Furka} alt="Stelvio pass" class="" />
				</figure>
				<Card.Body>
					<Card.Title>
						Furkapass
						<div class="badge badge-accent">Hightlight</div>
					</Card.Title>
					<Card.Content>
						Die bronzezeitlichen Funde im Oberwallis und im Vorderrheintal deuten auf Verbindungen
						und kulturellen Austausch zwischen dem Goms und Raetien hin. Urkundlich belegt ist
						sicher ein erster Höhepunkt des Verkehrs über die Furka, als um 1200 J. hunderte von
						deutschsprachigen Walsern mit ihren Familien sich im Urserental oder noch weiter
						ostwärts in Raetien niederliessen.
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
	</div>
</Section>
