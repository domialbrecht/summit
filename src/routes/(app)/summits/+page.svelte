<script lang="ts">
	import type { PageData } from './$types';
	import Card from './card.svelte';

	export let data: PageData;
</script>

{#await data.userActivities}
	loading
{:then activities}
	<div
		class="not-prose grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
	>
		{#each activities as userActivity}
			<Card username={`${userActivity.user.firstName}`} activity={userActivity.activity} />
		{:else}
			<p>No activities found</p>
		{/each}
	</div>
{:catch error}
	{error}
{/await}
