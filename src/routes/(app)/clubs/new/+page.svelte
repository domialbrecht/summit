<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import Section from '$lib/components/ui/section';

	let { data }: { data: PageData } = $props();

	const { form, errors, constraints, delayed, message } = superForm(data.form);
</script>

<Section sectionId="club-new" size="small">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		Club <span class="text-primary">registriere</span>
	</div>

	<p class="text-base-content/60 mt-4 text-lg">
		Gib d Strava Club ID ii. Du muesch Admin vom Strava Club si zum ne registriere.
	</p>

	{#if $message}
		<div role="alert" class="alert mt-6" class:alert-error={$page.status >= 400}>
			<span>{$message}</span>
		</div>
	{/if}

	<form method="POST" class="mt-8 max-w-md">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Strava Club ID</legend>
			<input
				class="input w-full"
				type="number"
				name="strava_club_id"
				placeholder="z.B. 1196981"
				aria-invalid={$errors.strava_club_id ? 'true' : undefined}
				bind:value={$form.strava_club_id}
				{...$constraints.strava_club_id}
			/>
			{#if $errors.strava_club_id}<span class="fieldset-label text-error"
					>{$errors.strava_club_id}</span
				>{/if}
			<span class="fieldset-label text-base-content/50">
				Findsch i dinere Strava Club URL: strava.com/clubs/[id]
			</span>
		</fieldset>
		<button class="btn btn-primary mt-4">Club registriere</button>
		{#if $delayed}Working...{/if}
	</form>
</Section>
