<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	let { children }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class="card-body">
	{@render children?.()}
</div>
