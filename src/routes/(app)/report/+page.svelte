<script lang="ts">
	import type { PageData } from './$types.js';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import Section from '$lib/components/ui/section';

	let { data }: { data: PageData } = $props();

	const { form, errors, constraints, delayed, message } = superForm(data.form);
</script>

<Section sectionId="reportForm">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		<span class="text-primary">Passerfolg</span> manuell erfasse
	</div>
	<div class="mt-6 grid gap-6 xl:grid-cols-12">
		<div class="col-span-12">
			<p>
				Die Funktion chasch bruche wenn bire Tour vo dir e Pass nid richtig isch erkannt worde. Due
				derzue der Pass suech uf <a class="link" href="/summits">Summits</a>. Wenn de ne ner
				akliksch findisch d ID. D Strava ID gsehsch zb uf der Desktop Variante. Wenn de Strava ufem
				<strong>Handy</strong>
				unterwegs bisch gsehsch das leider nid. Leueg denn i
				<a class="link" href="activities/me">dini Liste</a>
			</p>
		</div>
		<div class="col-span-12">
			{#if $message}
				<div role="alert" class="alert mb-3" class:alert-warning={$page.status >= 400}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="stroke-primary h-6 w-6 shrink-0"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>{$message}</span>
				</div>
			{/if}

			<form method="POST">
				<input type="hidden" name="userId" bind:value={data.user.id} />
				<input type="hidden" name="published" value={true} />

				<fieldset class="fieldset-legend">
					<legend>Pass Id</legend>
					<input
						class="input validator"
						name="summitId"
						aria-invalid={$errors.summitId ? 'true' : undefined}
						bind:value={$form.summitId}
						{...$constraints.summitId}
					/>
					{#if $errors.summitId}<span class="lavel">{$errors.summitId}</span>{/if}
				</fieldset>

				<fieldset class="fieldset-legend">
					<legend
						>Strava Id (bsp. https://www.strava.com/activities/<span class="text-primary"
							>16011589814</span
						>)</legend
					>
					<input
						class="input validator"
						name="activityId"
						aria-invalid={$errors.activityId ? 'true' : undefined}
						bind:value={$form.activityId}
						{...$constraints.activityId}
					/>
					{#if $errors.activityId}<span class="label">{$errors.activityId}</span>{/if}
				</fieldset>

				<fieldset>
					<legend class="fieldset-legend">Datum</legend>
					<input
						class="input validator [color-scheme:light]"
						name="date"
						type="datetime-local"
						bind:value={$form.date}
						aria-invalid={$errors.date ? 'true' : undefined}
						{...$constraints.date}
					/>
					{#if $errors.date}<span class="label">{$errors.date}</span>{/if}
				</fieldset>

				<button class="btn btn-primary mt-3">Submit</button>
				{#if $delayed}Working...{/if}
			</form>
		</div>
	</div>
</Section>
