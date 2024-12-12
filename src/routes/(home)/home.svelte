<script lang="ts">
	import Hero from './hero.svelte';
</script>

<div
	class="flex min-h-[100vh] max-w-[100vw] items-center justify-start xl:flex-row xl:items-start xl:justify-between"
>
	<div class="relative z-10 shrink xl:w-1/2">
		<div
			class="flex min-h-[calc(80vh-4rem)] items-center justify-center px-2 py-10 text-center xl:justify-start xl:pe-0 xl:ps-20 xl:text-start"
		>
			<Hero />
		</div>
	</div>
</div>
