<script>
	import { page } from '$app/stores';
	import Dizzy from '$site/icons/dizzy.png';
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="max-w-xl">
			<h1 class="mb-5 text-5xl font-bold opacity-10 lg:text-7xl xl:text-9xl">Error occoured</h1>
			<img src={Dizzy} alt="Dizzy emoji" class="mx-auto h-32 w-32" />
			{#if $page.error}
				<p class="mb-5 text-xl">{$page.error.message}</p>
			{/if}

			<a class="btn btn-outline" href="/">Go back</a>
		</div>
	</div>
</div>
