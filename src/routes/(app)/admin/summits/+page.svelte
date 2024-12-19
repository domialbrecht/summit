<script lang="ts">
	import type { PageData } from './$types';
	import SummitMap from '$lib/components/map/summits.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="grid min-h-screen grid-cols-3">
	{#await data.summitPromise}
		loading
	{:then summits}
		<div class="col-span-2 flex w-full">
			<SummitMap />
		</div>
		<!-- <div class="flex flex-col justify-between"> -->
		<!-- 	<div> -->
		<!-- 		{#each summits as summit} -->
		<!-- 			{summit.name} -->
		<!-- 		{:else} -->
		<!-- 			<p>No summits found</p> -->
		<!-- 		{/each} -->
		<!-- 	</div> -->
		<!-- 	<div>add</div> -->
		<!-- </div> -->
	{:catch error}
		{error}
	{/await}
</div>
