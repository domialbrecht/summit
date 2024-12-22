<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const cardVariants = tv({
		base: 'card shadow-xl',
		variants: {
			variant: {
				default: 'bg-base-100',
				primary: 'bg-primary text-base-100',
				border: 'card-bordered',
				image: 'image-full',
				side: 'card-side',
				sideResponsive: 'lg:card-side'
			},
			size: {
				default: 'w-full',
				normal: 'w-96'
			},
			spacing: {
				default: 'card-normal',
				compact: 'card-compact'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			spacing: 'default'
		}
	});

	export type CardVariant = VariantProps<typeof cardVariants>['variant'];
	export type CardSize = VariantProps<typeof cardVariants>['size'];
	export type CardSpacing = VariantProps<typeof cardVariants>['spacing'];

	export type CardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: CardVariant;
		size?: CardSize;
		spacing?: CardSpacing;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		spacing = 'default',
		ref = $bindable(null),
		children,
		...restProps
	}: CardProps = $props();
</script>

<div bind:this={ref} class={cn(cardVariants({ variant, size, spacing, className }))} {...restProps}>
	{@render children?.()}
</div>
