<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import AreaCard from './area.svelte';
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
				Regio Erfolge
			</div>
			<p class="pt-4">
				Regio Erfolge si persönlechi Ziel e Gruppe a Päss komplett abgschlosse z ha. Derbi muesch
				mindestens jede einisch erledigt ha. Unabhängig dervo obde z erste bisch oder nid.
			</p>
			<div class="mt-6 grid gap-6 xl:grid-cols-12">
				{#await data.areas}
					<div class="skeleton h-44 xl:col-span-4"></div>
					<div class="skeleton h-44 xl:col-span-4"></div>
					<div class="skeleton h-44 xl:col-span-4"></div>
				{:then entries}
					{#each entries as entry}
						<AreaCard {...entry} />
					{/each}
				{/await}
			</div></Section
		>
	</div>
	<div class="section-normal mx-auto mb-4 w-full max-w-7xl bg-base-100 px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
