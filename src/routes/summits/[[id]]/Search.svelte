<script lang="ts">
	let { handleSearch } = $props();
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';
	import { Combobox } from 'bits-ui';
	import { ChevronDown, ChevronUp, MountainSnow } from 'lucide-svelte';

	let query = $state('');

	type Summit = {
		id: number;
		name: string;
		alias: string;
		lat: number;
		long: number;
	};

	let fuse: Fuse<Summit> | undefined;
	onMount(async () => {
		const res = await fetch('/summits/index');
		if (!res.ok) {
			console.error('Failed to fetch summit index');
			return;
		}

		const index = await res.json();
		fuse = new Fuse(index, {
			keys: ['name', 'alias'],
			includeScore: true,
			threshold: 0.3
		});
	});

	let searchInput = $state<HTMLInputElement | null>(null);
	const results = $derived.by(() => {
		if (!fuse || query.trim().length < 3) return [];
		return fuse.search(query).map((r) => r.item);
	});
</script>

<div
	class="fixed right-2 bottom-10 left-2 z-10 flex w-auto justify-end px-2 lg:top-2 lg:right-auto lg:bottom-auto lg:left-10"
>
	<Combobox.Root
		onValueChange={(value) => {
			const [lat, long] = value.split('-')[1].split('=');
			query = '';
			if (searchInput) {
				searchInput.value = '';
			}
			handleSearch(lat, long);
		}}
		type="single"
		name="summitSearch"
	>
		<div class="relative w-full">
			<Combobox.Input
				bind:ref={searchInput}
				oninput={(e) => (query = e.currentTarget.value)}
				class="input w-full text-lg lg:w-56"
				placeholder="Sueche"
				aria-label="Sueche"
			/>
			<Combobox.Trigger class="absolute end-3 top-1/2 size-6 -translate-y-1/2">
				<MountainSnow />
			</Combobox.Trigger>
		</div>
		<Combobox.Portal>
			<Combobox.Content
				class="focus-override border-muted bg-base-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-xl border px-1 py-3 shadow outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
				sideOffset={10}
				onInteractOutside={() => (query = '')}
			>
				<Combobox.ScrollUpButton class="flex w-full items-center justify-center py-1">
					<ChevronUp class="size-3" />
				</Combobox.ScrollUpButton>
				<Combobox.Viewport class="p-1">
					{#each results as summit, i (i + summit.id)}
						<Combobox.Item
							class="rounded-button data-highlighted:bg-muted flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none"
							value={`${summit.id}-${summit.lat}=${summit.long}`}
							label={summit.name}
						>
							{summit.name}
						</Combobox.Item>
					{:else}
						<span class="block px-5 py-2 text-sm text-muted-foreground">
							No results found, try again.
						</span>
					{/each}
				</Combobox.Viewport>
				<Combobox.ScrollDownButton class="flex w-full items-center justify-center py-1">
					<ChevronDown class="size-3" />
				</Combobox.ScrollDownButton>
			</Combobox.Content>
		</Combobox.Portal>
	</Combobox.Root>
</div>
