<script lang="ts">
	import Map from './map.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import Navbar from '$lib/components/navbar.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';
	import type { LngLat } from 'maplibre-gl';

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;
	const { form, errors, constraints, enhance, delayed, message } = superForm(data.form);

	let open = $state($form.id > 0);

	$effect(() => {
		if (!open) {
			tempMarkers = [];
		}
	});

	function handleClick(e: LngLat | null) {
		if (e && $form.id === 0) {
			tempMarkers = [{ lngLat: e }];
			$form.lat = e.lat.toString();
			$form.long = e.lng.toString();
		}
		open = true;
	}

	let tempMarkers: { lngLat: LngLat }[] = $state([]);
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<div class="h-screen w-full">
				<Map markers={tempMarkers} {handleClick} />
			</div>
			<Drawer.Root direction={'left'} bind:open>
				<Drawer.Content contentProps={{ variant: 'left' }} class="lg:w-1/2">
					<div class="m-4 flex min-h-0 grow flex-col gap-6 overflow-y-auto">
						<div class="h-52"><SuperDebug data={$form} /></div>
						<div>
							{#if $message}
								<h3 class:invalid={page.status >= 400}>{$message}</h3>
							{/if}
							<h1 class="font-title mb-0 text-4xl font-black leading-none text-primary">
								{!$form.id ? 'Create' : 'Update'} Summit
							</h1>
							<form method="POST" use:enhance>
								<input type="hidden" name="id" bind:value={$form.id} />
								<!-- FORM INPUTS -->
								<label class="form-control w-full">
									<div class="label">
										<span class="label-text">Passname:</span>
									</div>
									<input
										placeholder="Name"
										class="input input-bordered w-full"
										name="name"
										aria-invalid={$errors.name ? 'true' : undefined}
										bind:value={$form.name}
										{...$constraints.name}
									/>
									{#if $errors.name}
										<div class="label">
											<span class="label-text-alt">{$errors.name}</span>
										</div>
									{/if}
								</label>
								<label class="form-control w-full">
									<div class="label">
										<span class="label-text">Url:</span>
									</div>
									<input
										placeholder="Url"
										class="input input-bordered w-full"
										name="slug"
										aria-invalid={$errors.slug ? 'true' : undefined}
										bind:value={$form.slug}
										{...$constraints.slug}
									/>
									{#if $errors.slug}
										<div class="label">
											<span class="label-text-alt">{$errors.slug}</span>
										</div>
									{/if}
								</label>
								<label class="form-control w-full">
									<div class="label">
										<span class="label-text">Alias:</span>
									</div>
									<input
										placeholder="Optional"
										class="input input-bordered w-full"
										name="alias"
										aria-invalid={$errors.alias ? 'true' : undefined}
										bind:value={$form.alias}
										{...$constraints.alias}
									/>
									{#if $errors.alias}
										<div class="label">
											<span class="label-text-alt">{$errors.alias}</span>
										</div>
									{/if}
								</label>
								<label class="form-control w-full">
									<div class="label">
										<span class="label-text">Beschribig:</span>
									</div>
									<textarea
										placeholder="Description"
										class="textarea textarea-bordered h-28 w-full"
										name="description"
										aria-invalid={$errors.description ? 'true' : undefined}
										bind:value={$form.description}
										{...$constraints.description}
									></textarea>
									{#if $errors.description}
										<div class="label">
											<span class="label-text-alt">{$errors.description}</span>
										</div>
									{/if}
								</label>
								<div class="flex gap-2">
									<label class="form-control w-full">
										<div class="label">
											<span class="label-text">Lat:</span>
										</div>
										<input
											placeholder="Latitude"
											class="input input-bordered w-full"
											name="lat"
											aria-invalid={$errors.lat ? 'true' : undefined}
											bind:value={$form.lat}
											{...$constraints.lat}
										/>
										{#if $errors.lat}
											<div class="label">
												<span class="label-text-alt">{$errors.lat}</span>
											</div>
										{/if}
									</label>
									<label class="form-control w-full">
										<div class="label">
											<span class="label-text">Long:</span>
										</div>
										<input
											placeholder="Longitude"
											class="input input-bordered w-full"
											name="long"
											aria-invalid={$errors.long ? 'true' : undefined}
											bind:value={$form.long}
											{...$constraints.long}
										/>
										{#if $errors.long}
											<div class="label">
												<span class="label-text-alt">{$errors.long}</span>
											</div>
										{/if}
									</label>
								</div>
								<div class="flex gap-2">
									<label class="form-control w-full">
										<div class="label">
											<span class="label-text">Elevation:</span>
										</div>
										<input
											placeholder="Elevation"
											class="input input-bordered w-full"
											name="elevation"
											aria-invalid={$errors.elevation ? 'true' : undefined}
											bind:value={$form.elevation}
											{...$constraints.elevation}
										/>
										{#if $errors.elevation}
											<div class="label">
												<span class="label-text-alt">{$errors.elevation}</span>
											</div>
										{/if}
									</label>
									<label class="form-control w-full">
										<div class="label">
											<span class="label-text">Category:</span>
										</div>
										<input
											placeholder="Category"
											class="input input-bordered w-full"
											name="category"
											aria-invalid={$errors.category ? 'true' : undefined}
											bind:value={$form.category}
											{...$constraints.category}
										/>
										{#if $errors.category}
											<div class="label">
												<span class="label-text-alt">{$errors.category}</span>
											</div>
										{/if}
									</label>
								</div>
								<!-- FORM FOOTER -->
								<div class="mt-2">
									{#if $form.id}
										<button name="delete" class="btn btn-warning">Delete summit</button>
									{/if}
									<button class="btn btn-primary">{!$form.id ? 'Create' : 'Update'}</button>
									{#if $delayed}Working...{/if}
								</div>
							</form>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</div>
