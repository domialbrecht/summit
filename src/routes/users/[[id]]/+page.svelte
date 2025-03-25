<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import Trophy from '$site/icons/trophy.png';
	import Finish from '$site/icons/finish.png';
	import Section from '$lib/components/ui/section';
	import { page } from '$app/state';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	const { user } = page.data;
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div
		class="md:gap-y-30 mb-20 flex flex-col gap-y-20 overflow-hidden pt-28 sm:mb-32 sm:gap-y-32 md:mb-40 md:pt-32"
	>
		<Section sectionId="table">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none text-primary">
				{data.user?.name}'s Päss
			</div>
			<div>
				{#if data.userSummits}
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Trophäe</th>
								</tr>
							</thead>
							<tbody>
								{#each data.userSummits as entry}
									<tr>
										<th>
											<a href={`/summits/${entry.summitId}`} class="badge badge-ghost badge-sm"
												>{entry.summitName}</a
											>
										</th>
										<th>
											{#if entry.winAttempt}
												<img src={Trophy} alt="trophy" class="h-8 w-8" />
											{:else}
												<img src={Finish} alt="finish" class="h-8 w-8" />
											{/if}
										</th>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					No kei Summits
				{/if}
			</div>
		</Section>
	</div>
	<div class="section-normal mx-auto mb-4 w-full max-w-7xl bg-base-100 px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
