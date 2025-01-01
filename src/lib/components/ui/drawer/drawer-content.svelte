<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const drawerContentVariants = tv({
		base: 'fixed flex border bg-base-100 z-50',
		variants: {
			variant: {
				bottom: 'inset-x-0 bottom-0 h-auto flex-col rounded-t-[10px]',
				left: 'bottom-0 left-0 top-0 flex-col lg:flex-row lg:flex-row-reverse lg:rounded-r-[10px]'
			}
		},
		defaultVariants: {
			variant: 'bottom'
		}
	});

	export type DrawerContentVariant = VariantProps<typeof drawerContentVariants>['variant'];

	export type DrawerContentProps = {
		variant?: DrawerContentVariant;
	};
</script>

<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import DrawerOverlay from './drawer-overlay.svelte';
	import { cn } from '$lib/utils.js';
	import clsx from 'clsx';

	let {
		ref = $bindable(null),
		class: className,
		contentProps,
		portalProps,
		children,
		...restProps
	}: DrawerPrimitive.ContentProps & {
		contentProps?: DrawerContentProps;
		portalProps?: DrawerPrimitive.PortalProps;
	} = $props();
</script>

<DrawerPrimitive.Portal {...portalProps}>
	<DrawerOverlay />
	<DrawerPrimitive.Content
		bind:ref
		class={cn(drawerContentVariants({ variant: contentProps?.variant, className }))}
		{...restProps}
	>
		<div
			class={clsx({
				'hidden rounded-full bg-base-200 lg:block': true,
				'mx-auto mt-4 h-1.5 w-12': contentProps?.variant === 'bottom',
				'mx-4 my-auto h-12 w-1.5': contentProps?.variant === 'left'
			})}
		></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPrimitive.Portal>
