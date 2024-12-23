<script lang="ts">
	import Tourmalet from '$site/tourmalet.jpg?enhanced';
	import Banner from '$site/banner.jpg?enhanced';
</script>

<div class="gap-20p grid min-h-screen grid-cols-2">
	<div class="flex flex-col items-center gap-8 px-24 pt-28 text-center">
		<enhanced:img src={Banner} alt="Stelvio pass" class="" />
		<h1 class="text-5xl font-bold">Strava Login</h1>
		<p class="mb-5">
			Mir bruche Strava einersits als Login Methode, aber ou um dini Aktivitätä z lade. Mir si no
			amene direkte Upload am schaffe.
		</p>
		<a href="/login/strava" class="btn btn-primary btn-wide border-none">Login</a>
	</div>
	<div class="min-h-full overflow-hidden">
		<enhanced:img src={Tourmalet} alt="Tourmalet pass" class="h-full w-auto max-w-none" />
	</div>
</div>
