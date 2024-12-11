<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Hi, {data.user.stravaId}!</h1>
<img src={data.user.profile} height="100px" width="100px" alt="profile" />
<form action="?/logout" method="post" use:enhance>
	<button>Sign out</button>
</form>

<form action="?/sync" method="post" use:enhance>
	<button>Sync my activities</button>
</form>
