<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Section from '$lib/components/ui/section';
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/stores';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	let activityName = $derived.by(() =>
		data.summits ? data.summits[0]?.strava_activity?.name : ''
	);

	const { form, errors, enhance, delayed, message } = superForm(data.submitForm, {
		invalidateAll: true
	});

	let selectedChallengeId = $state<number | null>(null);

	$effect(() => {
		if (selectedChallengeId !== null) {
			$form.challengeId = selectedChallengeId;
		}
	});

	function getPreviousAttempt(challengeId: number) {
		return data.existingAttempts.find((a) => a.challengeId === challengeId);
	}
</script>

<Section sectionId="postsync">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		<span class="text-primary">Päss uf</span>
		"{activityName}"
	</div>
	<p class="mt-2 mb-2 max-w-2xl">
		Hie gsehsch aui Aktivitäte womer gsynched hei. Und die wo e Pass isch erkennt worde hei es
		"Pass" Zeiche. Falls was dire Meinig nach nid stimmt nim Kontakt uf.
	</p>
	<div class=""><Button href="/activities/me">Zrügg</Button></div>
	{#if data.summits.length > 0}
		<div class="mt-6 grid gap-6 xl:grid-cols-12">
			{#each data.summits as summit (summit.summit.id)}
				<div class="xl:col-span-4">
					<a
						class="card card-bordered hover:bg-primary hover:text-base-100 shadow-xl"
						href={`/summits/${summit.summit.id}`}
					>
						<div class="card-body">
							<h3 class="text-2xl font-black">{summit.summit.name}</h3>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-12 mb-8">Nix gfunde. Cha si das die Aktivität kei Pass het..</p>
	{/if}

	{#if data.joinedChallenges.length > 0}
		<div class="mt-10">
			<h2 class="font-title text-2xl font-black">
				<span class="text-primary">Challange</span> ischribe
			</h2>
			<p class="text-base-content/70 mt-1 mb-4 max-w-xl text-sm">
				Wähl e Challange us und lueg ob die Aktivität alli Punkte abdeckt.
			</p>

			{#if $message}
				<div
					role="alert"
					class="alert mb-4"
					class:alert-success={$page.status < 400}
					class:alert-warning={$page.status >= 400}
				>
					<span>{$message}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/submitToChallenge"
				use:enhance
				class="flex max-w-md flex-col gap-3"
			>
				<input type="hidden" name="challengeId" bind:value={$form.challengeId} />

				<div class="flex flex-col gap-2">
					{#each data.joinedChallenges as challenge (challenge.id)}
						{@const prev = getPreviousAttempt(challenge.id)}
						<label
							class="rounded-box border-base-300 hover:bg-base-200 flex cursor-pointer items-center gap-3 border p-3"
							class:border-primary={selectedChallengeId === challenge.id}
						>
							<input
								type="radio"
								class="radio radio-primary"
								name="challengeSelect"
								value={challenge.id}
								onchange={() => {
									selectedChallengeId = challenge.id;
								}}
							/>
							<span class="flex-1">
								<span class="font-semibold">{challenge.name}</span>
								{#if prev}
									<span class="text-base-content/50 ml-2 text-xs">
										{prev.completed ? '✓ Abgschlosse' : 'Teilwiis grunnt'}
									</span>
								{/if}
							</span>
						</label>
					{/each}
				</div>

				{#if $errors.challengeId}
					<span class="text-error text-sm">{$errors.challengeId}</span>
				{/if}

				<Button
					type="submit"
					disabled={$delayed || selectedChallengeId === null}
					class="self-start"
				>
					{$delayed
						? 'Pruefe...'
						: selectedChallengeId !== null && getPreviousAttempt(selectedChallengeId)
							? 'Nochmal pruefe'
							: 'Challange pruefe'}
				</Button>
			</form>
		</div>
	{/if}
</Section>
