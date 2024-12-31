<script lang="ts">
	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Navbar from '$lib/components/navbar.svelte';
	import Wins from './Wins.svelte';
	import Free from './Free.svelte';
	import Title from './Title.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';

	const { data }: { data: PageServerData } = $props();
	const { user } = page.data;

	let activeSummit = $derived(data.summit_data ? data.summit_data.id : null);
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
			<Drawer.Root direction={'left'} bind:open>
				<Drawer.Content contentProps={{ variant: 'left' }} class="lg:w-1/2">
					<div class="flex w-full flex-col px-8 py-5">
						{#if data.summit_data}
							<div id="summit-data" class="grow overflow-auto">
								<Title summit={data.summit_data} />
								<div class="prose mt-4">
									{data.summit_data.description}
									<p>
										Lorem ipsum odor amet, consectetuer adipiscing elit. At phasellus lobortis
										bibendum; ante accumsan suspendisse. Condimentum odio nulla venenatis; fames
										vivamus suspendisse aenean accumsan. Nascetur fames nunc facilisi platea euismod
										aliquam. Sem in inceptos suscipit lobortis nam magnis mus. Magnis pulvinar felis
										natoque fusce consectetur facilisi. Porta aenean auctor cubilia pulvinar mattis.
										Euismod mus fermentum est eget ultricies penatibus. Litora dui nec aenean;
										sociosqu metus donec erat.
									</p>
									<p>
										Cubilia dapibus in id aliquet aenean. Nullam integer semper platea dolor
										fringilla aenean tellus natoque. Himenaeos tortor mus magna commodo est class
										nec urna. Dolor vestibulum semper imperdiet morbi magna nascetur maecenas.
										Litora ac laoreet efficitur lacus ex orci molestie. Mauris lacus ex sem tempor
										lectus in nascetur.
									</p>
								</div>
								<div role="alert" class="alert mt-8">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										class="h-6 w-6 shrink-0 stroke-info"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<span
										>D Passinformatione si no in Arbeit. Hie werde no die verschidene Uffahrte choh
										mit Profil etc.</span
									>
								</div>
							</div>
							{#if data.summit_wins.length > 0}
								<div id="summit-wins">
									<Wins wins={data.summit_wins} />
								</div>
							{:else}
								<Free />
							{/if}
						{/if}
					</div>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</div>
