<script lang="ts">
	import Hero from '$lib/components/hero.svelte';
	import Heroimg from '$lib/components/heroimg.svelte';
</script>

<div
	class="flex min-h-[100vh] max-w-[100vw] items-center justify-start xl:flex-row xl:items-start xl:justify-between"
>
	<div class="shrink xl:w-1/2">
		<div
			class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-2 py-10 text-center xl:justify-start xl:pe-0 xl:ps-10 xl:text-start"
		>
			<Hero />
		</div>
	</div>
	<div class="shrink xl:w-1/2">
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-2 py-10 text-center">
			<Heroimg />
		</div>
	</div>
</div>
