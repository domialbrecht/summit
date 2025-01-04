<script lang="ts">
	import SummitMap from '$lib/components/map/summits.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import Navbar from '$lib/components/navbar.svelte';
	import Profile from './Profile.svelte';
	import Wins from './Wins.svelte';
	import Free from './Free.svelte';
	import Title from './Title.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';

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
			<Drawer.Root direction={'left'} bind:open>
				<Drawer.Content contentProps={{ variant: 'left' }} class="lg:w-1/2">
					{#if data.summit_data}
						<div class="m-4 flex min-h-0 grow flex-col gap-6">
							<div class="order-first bg-base-100">
								<Title summit_data={data.summit_data} handleClick={() => (open = false)} />
							</div>
							<div class="flex grow flex-col gap-4">
								<div id="summit-wins">
									<div class="collapse collapse-arrow">
										<input type="checkbox" name="accordion-2" checked />
										<div class="collapse-title text-xl font-medium">Trophäe</div>
										<div class="collapse-content">
											{#await data.summit_wins}
												<div class="skeleton h-40 w-full"></div>
											{:then wins}
												{#if wins.length > 0}
													<Wins {wins} />
												{:else}
													<Free />
												{/if}
											{/await}
										</div>
									</div>
								</div>
								<div id="summit-data" class="lg:overflow-auto">
									<div class="collapse collapse-arrow bg-base-200">
										<input type="checkbox" name="accordion-1" />
										<div class="collapse-title text-xl font-medium">Beschribig</div>
										<div class="collapse-content">
											<div class="prose lg:max-h-64 lg:!overflow-auto">
												{data.summit_data.summit.description}
											</div>
										</div>
									</div>
									<div class="collapse collapse-arrow mt-2 bg-base-200">
										<input type="checkbox" name="accordion-1" checked />
										<div class="collapse-title text-xl font-medium">Astige</div>
										<div class="collapse-content">
											{#await data.summit_profiles then profiles}
												<div class="flex flex-col gap-4">
													{#each profiles as profile}
														<div class="card bg-secondary">
															<div class="card-body">
																<Profile {profile} />
															</div>
														</div>
													{/each}
												</div>
											{/await}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</div>
