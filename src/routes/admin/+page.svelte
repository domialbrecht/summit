<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Hi, {data.user.stravaId}!</h1>

<form action="?/sync" method="post" use:enhance>
	<button>Sync my activities</button>
</form>
{#if form?.success}
	<p>Activity sync started. This will take some time. Will be available at /activities</p>
{/if}
