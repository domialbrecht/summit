<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#each data.userActivities as userActivity}
	<div>
		<p>Id: {userActivity.activity.id}</p>
		<p>User: {userActivity.user.firstName} {userActivity.user.lastName}</p>
		<p>Watts: {userActivity.activity.averageWatts}</p>
	</div>
{:else}
	<p>No activities found</p>
{/each}
