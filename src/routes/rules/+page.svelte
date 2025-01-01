<script lang="ts">
	import { page } from '$app/state';
	import Navbar from '$lib/components/navbar.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';
	import Section from '$lib/components/ui/section';

	import SolYVC from '$site/solyvc.svg';
	import Start from '$site/icons/finish.png';
	import Camera from '$site/icons/camera.png';
	import Tup from '$site/icons/tup.png';
	import Trophy from '$site/icons/trophy.png';
	import WomanBike from '$site/icons/womanbike.png';
	import Strava from '$lib/components/icons/strava.svelte';

	const { user } = page.data;
</script>

<div>
	<div>
		<Navbar {user} />
	</div>
	<div
		class="md:gap-y-30 mb-20 flex flex-col gap-y-20 overflow-hidden pt-20 sm:mb-32 sm:gap-y-32 sm:pt-28 md:mb-40 md:pt-32"
	>
		<Section size="small" id="rules">
			<h1 class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				<span class="text-primary">Summit </span> Challenge
			</h1>
			<p class="mt-4">
				D SolyVC Summit Challenge isch es sozials Event mitem Ziel müglechst viu Lüt zu grosse Gümp
				ufem Velo z motiviere. S Ziel isch eifach, müglechst viu verschideni Päss mitem Velo
				abzklappere. Hie findisch paar Zuesatzinfos:
			</p>
			<div class="mt-8 flex flex-col gap-8">
				<div>
					<div class="mb-4 flex items-center gap-4">
						<img src={Start} alt="trophy" class="h-12 w-12" />
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">I</span> Start und Endi
						</h2>
					</div>
					<p>
						Der <strong>Challenge</strong> Teil vom SolyVC Summit louft jährlech. Jewils vom 01.01.
						bis am 31.12. D Medaliä und d Trophäe werde jewils zum neue Jahr zrugg gsetzt. Z
						<a class="link-primary font-bold" href="/leaderboard">Leaderboard</a> louft aber immer witer.
					</p>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<img src={WomanBike} alt="trophy" class="h-12 w-12" />
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">II</span> Vorgehenswiis
						</h2>
					</div>
					<div class="lg:ps-16">
						<div class="flex items-center gap-4">
							<p>
								<strong>1.</strong> E Pass mues fürd Challenge ou mitmene SolyVC Sticker markiert werde
								damit er cha als Fahrt fürd Challenge akzeptiert werde. Hou der dini paar Sickers ab,
								chläb zoberst am Pass eine here, u lad derzue es Foti uf Strava ufe.
							</p>
							<img src={Camera} alt="trophy" class="h-8 w-8" />
						</div>
						<div class="mt-4 flex items-center gap-4">
							<p>
								<strong>2.</strong> D Summit App isch integriert mit Strava. Du ladisch dini Aktivität
								normal zerst vo dim Grät uf Strava. Derte muese si öffentlech si. Ei Aktivität cha mehreri
								Päss beinhalte.
							</p>
							<Strava class="h-[30px] w-[30px] shrink-0 fill-orange-600" />
						</div>
						<div class="mt-4 flex items-center gap-4">
							<p>
								<strong>3.</strong> Als letzts logisch di im SolyVC Summit App i. Derte geisch uf
								dis <a href="/" class="link-primary">Profil</a> und drüksch uf synchronisiere. Die
								<strong>letzte 2 Wuche</strong> werde synchronisiert. Z Programm erkennt erledigti Päss.
								Du chasch denne zumne Pass no es Textli u paar Bilder ufelade.
							</p>
							<img src={SolYVC} alt="SolYVC" class="w-8" />
						</div>
					</div>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<img src={Trophy} alt="trophy" class="h-12 w-12" />
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">III</span> Uszeichnige u Trophäe
						</h2>
					</div>
					<p>
						Es git verschideni Uszeichnige. Du gsehsch die im <a
							class="link-primary"
							href="/leaderboard">Leaderboard</a
						>. D Trophäe werde immer im neue Jahr zrug gsetzt, damit ou neui Lüt e Chance hei.
					</p>
					<ul>
						<li>
							<strong>Pokal:</strong> E Pokal bechunt pro Jahr die <strong>ersti Person</strong> ufem
							Pass
						</li>
						<li>
							<strong>Medallie: </strong> Gold, Silver und Bronze Medallie gits für die jewilig meist
							erledigte Pässe
						</li>
						<li>
							<strong>Trophäe: </strong> Alpestürmer, Emmentalprofi, Juraheld... Je nach Kategorie. Ou
							pro Jahr.
						</li>
					</ul>
					<p class="font-bold text-primary">
						Du chasch aso <strong>aui</strong> dini Passfahrte ufelade. Ou wenn bimne Pass scho e Pokal
						weg isch.
					</p>
				</div>
				<div>
					<div class="mb-4 flex items-center gap-4">
						<img src={Tup} alt="trophy" class="h-12 w-12" />
						<h2 class="font-title mb-0 text-3xl font-bold">
							<span class="text-primary">IV</span> Erloubt isch..
						</h2>
					</div>
					<p>
						<strong>Team</strong> Passfahrte si erloubt. Wenn dir als Gruppe obe amne Pass
						<strong>innerhalb vo eire Minute</strong> sind de werde Pokal, Trophäe u Medallie a alli
						vergäh.
					</p>
					<p class="mt-2">
						Mir si mit de Rennvelos unterwegs, d Päss si daher uf teereti Strasse limitiert. Du
						chasch aber mit jedem <strong>nid motorisierte ;)</strong> Velo teilneh. Houptsach viu Päss,
						Zyt isch sekundär..
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
