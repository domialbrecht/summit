<script lang="ts">
	import { page } from '$app/state';
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import Section from '$lib/components/ui/section';
	import { LocateFixed } from 'lucide-svelte';

	const { user } = page.data;
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div
		class="mb-20 flex flex-col gap-y-20 overflow-hidden pt-32 sm:mb-32 sm:gap-y-32 sm:pt-28 md:mb-40 md:gap-y-30 md:pt-32"
	>
		<Section size="small" id="rules">
			<h1 class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				<span class="text-primary">Neui </span> Funktione
			</h1>
			<div class="mt-8 flex flex-col gap-8">
				<div>
					<div class="mb-4 flex items-center gap-4">
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">I</span> Story
						</h2>
					</div>
					<p>
						Uf der Site <a class="link-primary font-bold" href="/story">Story</a> heimer e cooli Zemefassig
						vo dine Aktivität und Päss.
					</p>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">II</span> Manuell erfasse
						</h2>
					</div>
					<p>
						Du chasch neu i dim Profil selber fehlendi Päss are Aktivität zuewise. Bispiu <a
							class="link-primary font-bold"
							href="/report">hie.</a
						>
					</p>
				</div>
			</div></Section
		>
	</div>
	<div class="section-normal bg-base-100 mx-auto mb-4 w-full max-w-7xl px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
