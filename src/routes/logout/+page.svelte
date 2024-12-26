<script lang="ts">
	import Dark from '$site/dark.jpg?enhanced';
	import Banner from '$site/banner.jpg?enhanced';
</script>

<div class="flex h-screen flex-col gap-20 lg:flex-row">
	<div class="flex flex-col items-center gap-8 px-24 pt-28 text-center lg:w-1/2">
		<enhanced:img src={Banner} alt="Stelvio pass" class="" />
		<h1 class="text-5xl font-bold">Logout</h1>
		<p class="mb-5">Bye bye! 👋</p>
		<form method="POST">
			<button class="btn btn-primary btn-wide border-none">Logout</button>
		</form>
	</div>
	<div class="hidden h-full w-1/2 items-end justify-center overflow-hidden lg:flex">
		<enhanced:img src={Dark} alt="Logout image" class="min-h-full w-auto max-w-none" />
	</div>
</div>
