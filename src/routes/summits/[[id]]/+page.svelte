<script lang="ts">
	import Trophy from '$site/icons/trophy.png';

	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Navbar from '$lib/components/navbar.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import { dt } from '$lib/utils';

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;

	let activeSummit = $derived(data.summit_data ? data.summit_data.summit.id : null);
	let open = $state(false);

	$effect(() => {
		open = activeSummit ? true : false;
	});
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<div class="h-screen w-full">
				<SummitMap handleClick={() => (open = true)} />
			</div>
			<Drawer.Root bind:open>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-sm">
						{#if data.summit_data}
							<Drawer.Header>
								<Drawer.Title>{data.summit_data.summit.name}</Drawer.Title>
								<Drawer.Description>Pass Nr.{data.summit_data.summit.id}</Drawer.Description>
							</Drawer.Header>
							<div class="flex items-center gap-4 p-4 pb-0">
								{#if data.summit_data.winAttempt}
									<img src={Trophy} alt="trophy" class="h-12 w-12" />
									<div>
										<h2 class="font-title text-xl">{data.summit_data.username}</h2>
										<p>{dt(data.summit_data.winAttempt.date)}</p>
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
