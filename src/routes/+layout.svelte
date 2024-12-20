<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	let { children } = $props();
</script>

<Toaster />
<svelte:head>
	<title>SolyVC Summits</title>
	<meta name="description" content="SolyVC Summits Challange" />
</svelte:head>
<div>
	{@render children()}
</div>
