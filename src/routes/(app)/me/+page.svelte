<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Hi, {data.user.stravaId}!</h1>
<img src={data.user.profile} height="100px" width="100px" alt="profile" />
<form action="?/logout" method="post" use:enhance>
	<button>Sign out</button>
</form>

<form action="?/sync" method="post" use:enhance>
	<button>Sync my activities</button>
</form>
{#if form?.success}
	<p>Activity sync started. This will take some time. Will be available at /activities</p>
{/if}
