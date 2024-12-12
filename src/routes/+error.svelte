<script>
	import { page } from '$app/stores';
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="mb-5 text-5xl font-bold opacity-10 lg:text-7xl xl:text-9xl">Error</h1>
			{#if $page.error}
				<p class="mb-5">{$page.error.message}</p>
			{/if}
			<a class="btn btn-outline" href="/">Go back</a>
		</div>
	</div>
</div>
