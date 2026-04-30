<script lang="ts" module>
	/** Takes an oklch value like "58% 0.253 17.585" and returns a lighter version for accent */
	function lighten(oklch: string): string {
		const parts = oklch.trim().split(/\s+/);
		if (parts.length < 3) return oklch;
		const l = parseFloat(parts[0]);
		// Increase lightness by 6 percentage points, cap at 85
		const newL = Math.min(l + 6, 85);
		return `${newL}% ${parts[1]} ${parts[2]}`;
	}
</script>

<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { page } from '$app/state';
	let { children } = $props();

	let clubColor = $derived(page.data.activeClub?.primaryColor ?? null);
</script>

<Toaster />
<svelte:head>
	<title>SolyVC Summits</title>
	<meta name="description" content="SolyVC Summits Challenge" />
	{#if clubColor}
		{@html `<style>:root{--color-primary:oklch(${clubColor});--color-accent:oklch(${lighten(clubColor)});}</style>`}
	{/if}
</svelte:head>
<div>
	{@render children()}
</div>
