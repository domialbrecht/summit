<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const sectionVariants = tv({
		base: 'pb-8 mx-auto w-full px-4 sm:px-6 md:px-8',
		variants: {
			variant: {
				default: 'bg-base-100'
			},
			size: {
				default: 'max-w-7xl ',
				small: 'max-w-4xl'
			},
			spacing: {
				default: 'section-normal'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			spacing: 'default'
		}
	});

	export type SectionVariant = VariantProps<typeof sectionVariants>['variant'];
	export type SectionSize = VariantProps<typeof sectionVariants>['size'];
	export type SectionSpacing = VariantProps<typeof sectionVariants>['spacing'];

	export type SectionProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		sectionId?: string;
		variant?: SectionVariant;
		size?: SectionSize;
		spacing?: SectionSpacing;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		sectionId,
		class: className,
		variant = 'default',
		size = 'default',
		spacing = 'default',
		ref = $bindable(null),
		children,
		...restProps
	}: SectionProps = $props();
</script>

<section id={sectionId}>
	<div
		bind:this={ref}
		{...restProps}
		class={cn(sectionVariants({ variant, size, spacing, className }))}
	>
		{@render children?.()}
	</div>
</section>
