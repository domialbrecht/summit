<script lang="ts">
	import Home from './home.svelte';
	import Intro from './intro.svelte';
	import Community from './community.svelte';
	import Heroimg from './heroimg.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<div class="relative">
		<Home />

		<div class="absolute -right-6 bottom-0 z-0 w-10/12">
			<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10 text-center">
				<Heroimg />
			</div>
		</div>
	</div>
	<Intro />
	<Community users={data.users} />
</div>
