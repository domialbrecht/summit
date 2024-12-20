<script lang="ts">
	import type { PageData } from './$types.js';

	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();

	let activeSummit = $derived(data.summit ? data.summit.id : null);
	let open = $state(false);

	$effect(() => {
		open = activeSummit ? true : false;
	});
</script>

<div class="h-screen w-full">
	<SummitMap />
</div>
<Drawer.Root bind:open>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-sm">
			{#if data.summit}
				<Drawer.Header>
					<Drawer.Title>{data.summit.id}</Drawer.Title>
					<Drawer.Description>{data.summit.name}</Drawer.Description>
				</Drawer.Header>
				<div class="p-4 pb-0">
					<div class="flex items-center justify-center space-x-2">
						<Button variant="outline" size="icon" class="size-8 shrink-0 rounded-full">
							<span class="sr-only">Decrease</span>
						</Button>
						<div class="flex-1 text-center">
							<div class="text-7xl font-bold tracking-tighter"></div>
							<div class="text-muted-foreground text-[0.70rem] uppercase">Calories/day</div>
						</div>
						<Button variant="outline" size="icon" class="size-8 shrink-0 rounded-full">
							<span class="sr-only">Increase</span>
						</Button>
					</div>
					<div class="mt-3 h-[120px]"></div>
				</div>
				<Drawer.Footer>
					<Button>Submit</Button>
					<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
				</Drawer.Footer>
			{/if}
		</div>
	</Drawer.Content>
</Drawer.Root>
