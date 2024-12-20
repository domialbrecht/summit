<script lang="ts">
	import Hero from './hero.svelte';
	import Intro from './intro.svelte';
	import Community from './community.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<Hero />
	<Intro />
	<Community users={data.users} />
</div>
