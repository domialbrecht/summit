<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('card w-96 bg-primary text-primary-content', className)} {...restProps}>
	<div class="card-body">
		{@render children?.()}
	</div>
</div>
