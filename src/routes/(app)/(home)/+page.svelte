<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Furka from '$site/furka.jpg?enhanced';
	import Dizzy from '$site/icons/dizzy.png';
	import type { User } from '$lib/server/db/schema';

	const { user }: { user: User | null } = $props();
	const version = import.meta.env.VITE_APP_VERSION;
</script>

<Section sectionId="welcome">
	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		<div class="col-span-12">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				Hey, <span class="text-primary">{user?.firstName}</span>
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
						data-tip="Aktuelle Fortschritt"
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
							Aktueller Fortschritt zu 1.0
						</div></a
					>
				</div>
				<!---->
			</div>
		</div>
		<div class="xl:col-span-7">
			<Card.Root variant="border">
				<Card.Body>
					<Card.Title>Di letzt Pass</Card.Title>
					<Card.Content>
						<div class="flex items-center gap-4">
							<img src={Dizzy} class="h-8 w-8" alt="Dizzy" />
							<p>Leider no kene gfunde..</p>
						</div>
					</Card.Content>
				</Card.Body>
			</Card.Root>
		</div>
		<div class="xl:col-span-5">
			<Card.Root variant="primary">
				<Card.Body>
					<Card.Title>Aktualisier dini Date</Card.Title>
					<Card.Content>
						<a href="/sync" class="btn btn-secondary">Synchronisiere</a>
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
