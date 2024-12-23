<script lang="ts">
	import type { PageData } from './$types.js';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	let { data }: { data: PageData } = $props();

	const { form, errors, constraints, enhance, delayed, message } = superForm(data.form);
</script>

{#if $message}
	<h3 class:invalid={$page.status >= 400}>{$message}</h3>
{/if}

<h2>{!$form.id ? 'Create' : 'Update'} user</h2>

<form method="POST" use:enhance>
	<input type="hidden" name="id" bind:value={$form.id} />

	<label>
		Name<br />
		<input
			name="name"
			aria-invalid={$errors.name ? 'true' : undefined}
			bind:value={$form.name}
			{...$constraints.name}
		/>
		{#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}
	</label>

	{#if $form.id}
		<button name="delete" class="danger">Delete user</button>
	{/if}
	<button>Submit</button>
	{#if $delayed}Working...{/if}
</form>

<SuperDebug data={$form} />
