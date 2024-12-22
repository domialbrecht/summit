<script lang="ts">
	import type { PageData } from './$types.js';
	import Trophy from '$site/icons/trophy.png';

	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Navbar from '$lib/components/navbar.svelte';

	let { data }: { data: PageData } = $props();

	let activeSummit = $derived(data.summit ? data.summit.id : null);
	let open = $state(false);

	$effect(() => {
		open = activeSummit ? true : false;
	});
</script>

<div>
	<div>
		<Navbar user={data.user} />
	</div>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<div class="h-screen w-full">
				<SummitMap />
			</div>
			<Drawer.Root bind:open>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-sm">
						{#if data.summit}
							<Drawer.Header>
								<Drawer.Title>{data.summit.name}</Drawer.Title>
								<Drawer.Description>Pass Nr.{data.summit.id}</Drawer.Description>
							</Drawer.Header>
							<div class="flex items-center gap-4 p-4 pb-0">
								{#if data.summit.id === 660}
									<!-- content here -->
									<img src={Trophy} alt="trophy" class="h-12 w-12" />
									<div>
										<h2 class="font-title text-xl">Patrick Burki</h2>
										<p>Am 01.01.2025</p>
									</div>
								{:else}
									<div>
										<h2 class="font-title text-xl">Kei Erklimmig</h2>
										<p>Lezgo</p>
									</div>
								{/if}
							</div>
							<Drawer.Footer>
								<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
							</Drawer.Footer>
						{/if}
					</div>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</div>
