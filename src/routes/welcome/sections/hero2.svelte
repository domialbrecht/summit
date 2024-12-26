<script lang="ts">
	import Hundred from '$site/icons/hundred.png';
	import Party from '$site/icons/party.png';
	import Stelvio from '$site/stelvio.jpg?enhanced';
	import Furka from '$site/furka.jpg?enhanced';
</script>

<div>
	<div class="max-w-[100vw] px-2 py-10 lg:px-10 xl:max-w-[50vw]">
		<div class="font-title text-center xl:text-start">
			<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none">
				<!--[-->Summits isch <br />üses Tagebuech<br />vo aune Päss<!--]-->
				<img
					loading="lazy"
					width="72"
					height="72"
					alt="yawing face emoji"
					src={Hundred}
					class="pointer-events-none inline-block h-[1em] w-[1em] align-bottom"
				/>
			</h2>
			<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
				Mir hoffe die App wachst u zeigt nis i de nächschte Jahr, wo mir überall gsi si. Dank em
				Aktivitäte Sync heimer vili spannandi Infos.
			</p>
			<div class="h-40"></div>
			<div class="relative h-[100vh]">
				<div class="sticky top-[16vh] xl:top-[30vh]">
					<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none">
						sammle düämer Päss<br />
						<span class="text-primary">ufder <span class="font-black">ganze</span> Wäut</span
						><!--]-->
					</h2>
					<div class="h-6"></div>
					<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
						<!--[-->Mir si froh um cooli Fotis vo dine Route...
						<a class="link-primary" href="/">Ufelade</a>
						<enhanced:img src={Stelvio} alt="Stelvio pass" class="mt-4 lg:hidden" />
					</p>
					<div class="h-24"></div>
				</div>
			</div>
			<div class="relative h-screen">
				<div class="sticky top-[16vh] xl:top-[30vh]">
					<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none">
						mir tracke natürli<br />ou
						<span class="text-primary"><span class="font-black">Team</span> Efforts</span><!--]-->
						<img
							loading="lazy"
							width="72"
							height="72"
							alt="sunglasses emoji"
							src={Party}
							class="pointer-events-none inline-block h-[1em] w-[1em] align-bottom"
						/>
					</h2>
					<div class="h-6"></div>
					<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
						Umso meh Lüt, umso meh Spass. Mir freue nis uf dini Aktivitäte.
					</p>
					<enhanced:img src={Furka} alt="Stelvio pass" class="mt-4 lg:hidden" />
					<div class="h-20"></div>
				</div>
			</div>
		</div>
	</div>
</div>
