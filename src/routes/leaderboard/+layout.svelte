<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import type { LayoutData } from './$types';
	import Section from '$lib/components/ui/section';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	const { user } = page.data;

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div
		class="mb-20 flex flex-col gap-y-20 overflow-hidden pt-28 sm:mb-32 sm:gap-y-32 md:mb-40 md:gap-y-30 md:pt-32"
	>
		<Section sectionId="table">
			<h1 class="font-title text-primary text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				Leaderboard
			</h1>
			<div class="mt-8">
				<ul class="flex flex-wrap gap-4">
					{#each data.seasons as s (s.slug)}
						<li>
							<a
								class="badge hover:badge-primary [&.active]:badge-primary mr-2 mb-2 cursor-pointer px-4 py-3 text-lg font-semibold"
								class:active={page.url.pathname === `/leaderboard/season/${s.slug}`}
								href={`/leaderboard/season/${s.slug}`}>{s.name}</a
							>
						</li>
					{/each}
				</ul>
				{@render children()}
			</div>
		</Section>
	</div>
	<div class="section-normal bg-base-100 mx-auto mb-4 w-full max-w-7xl px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
