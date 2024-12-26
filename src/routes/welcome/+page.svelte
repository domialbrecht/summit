<script lang="ts">
	import Hero from './hero.svelte';
	import Intro from './intro.svelte';
	import Community from './community.svelte';
	import PoweredBy from '$lib/components/poweredby.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<Hero />
	<Intro />
	<Community users={data.users} />
	<div class="section-normal mx-auto mb-4 w-full max-w-7xl bg-base-100 px-4 sm:px-6 md:px-8">
		<div class="flex justify-end">
			<PoweredBy />
		</div>
	</div>
</div>
