<script lang="ts">
	import Home from '$lib/components/home.svelte';
	import Intro from '$lib/components/intro.svelte';
	import Stats from '$lib/components/stats.svelte';
	import Community from '$lib/components/community.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Heroimg from '$lib/components/heroimg.svelte';
</script>

<div>
	<div class="relative">
		<Navbar />
		<Home />

		<div class="absolute -right-6 bottom-20 z-0 w-10/12">
			<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10 text-center">
				<Heroimg />
			</div>
		</div>
	</div>
	<Intro />
	<Stats />
	<Community />
</div>
