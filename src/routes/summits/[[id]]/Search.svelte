<script lang="ts">
	let { handleSearch } = $props();
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';
	import { Combobox, Dialog } from 'bits-ui';
	import { ChevronDown, ChevronUp, MountainSnow, Search, X } from 'lucide-svelte';

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

	let timer: ReturnType<typeof setTimeout>;
	let query = $state('');
	const debounce = (v: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			query = v;
		}, 750);
	};

	const results = $derived.by(() => {
		if (!fuse || query.trim().length < 3) return [];
		const res = fuse.search(query).map((r) => r.item);
		return res;
	});

	let selectedSummit = $state<string | undefined>(undefined);
	function go() {
		if (!selectedSummit) return;
		const [lat, long] = selectedSummit.split('-')[1].split('=');
		query = '';
		handleSearch(lat, long);
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="btn btn-secondary btn-circle">
		<Search />
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="card bg-base-100 shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-4 left-[50%] z-50 w-full max-w-[calc(100%-2rem)]  translate-x-[-50%] border p-5 outline-hidden sm:max-w-[490px] md:w-full"
		>
			<Dialog.Title
				class="flex w-full items-center justify-center text-lg font-semibold tracking-tight"
			>
				Sueche
			</Dialog.Title>
			<div class="flex flex-col items-start gap-1 pt-7 pb-11">
				<Combobox.Root bind:value={selectedSummit} type="single" name="summitSearch">
					<div class="relative w-full">
						<Combobox.Input
							oninput={(e) => debounce(e.currentTarget.value)}
							class="input w-full text-lg "
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
								{#each results as summit (summit.id)}
									<Combobox.Item
										class="rounded-button data-highlighted:bg-muted flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none"
										value={`${summit.id}-${summit.lat}=${summit.long}`}
										label={summit.name}
									>
										{summit.name}
									</Combobox.Item>
								{:else}
									<span class="block px-5 py-2 text-sm text-muted-foreground">
										Nix gfunde. Mindestens 3 Buechstabe
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
			<div class="flex w-full justify-end">
				<Dialog.Close class="btn btn-primary" onclick={go}>Go</Dialog.Close>
			</div>
			<Dialog.Close
				class="focus-visible:ring-foreground focus-visible:ring-offset-background absolute top-5 right-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98]"
			>
				<div>
					<X class="text-foreground size-5" />
					<span class="sr-only">Close</span>
				</div>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
