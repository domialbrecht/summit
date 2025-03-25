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
		class="md:gap-y-30 mb-20 flex flex-col gap-y-20 overflow-hidden pt-32 sm:mb-32 sm:gap-y-32 sm:pt-28 md:mb-40 md:pt-32"
	>
		<Section size="small" id="rules">
			<h1 class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				<span class="text-primary">Neui </span> Funktione
			</h1>
			<div class="mt-8 flex flex-col gap-8">
				<div>
					<div class="mb-4 flex items-center gap-4">
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">I</span> Lokalisierig
						</h2>
					</div>
					<p>
						Uf der Site <a class="link-primary font-bold" href="/summits">Päss</a> chasch neu obe
						links mitem <LocateFixed class="inline-flex" /> Icon di Standort azeige. Das hiuft der evtl
						derbi unterwegs z luege wo der nächst Summit steit.
					</p>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">II</span> Persönlichi Pässliste
						</h2>
					</div>
					<p>
						Uf der Leaderboardsite chasch neu uf e Name vore Person klicke. Derte gsehsch aui Päss
						vo e Person abgschlosse het. Bispiu <a
							class="link-primary font-bold"
							href="/users/104482993">vo mir.</a
						>
					</p>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">III</span> Erfolge
						</h2>
					</div>
					<p>
						Es git e neui Site <a class="link-primary font-bold" href="/achievements">Erfolge.</a> Derte
						simer dranne neui Infos und Areize z schaffe damit müglechst vili Päss vo aune Teilnehmer
						erreicht werde.
					</p>
					<p>
						Aui Päss si kategorisiert ine Gägend. Du bechunsch Uszeichnige wede Gägende
						abklapperisch. Bispiuswis der CH Jura komplett.
					</p>
					<p>
						<strong>Die Site boue mer aktuell no us. Blib gspannt.</strong>
					</p>
				</div>
			</div>
		</Section>
	</div>
	<div class="section-normal mx-auto mb-4 w-full max-w-7xl bg-base-100 px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
