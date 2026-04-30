<script lang="ts">
	import Section from '$lib/components/ui/section';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// --- Color conversion helpers ---
	function oklchToHex(oklch: string): string {
		const parts = oklch.trim().split(/\s+/);
		if (parts.length < 3) return '#6d28d9';
		const L = parseFloat(parts[0]) / 100;
		const C = parseFloat(parts[1]);
		const H = parseFloat(parts[2]) * (Math.PI / 180);

		const a = C * Math.cos(H);
		const b = C * Math.sin(H);

		// Oklab → linear sRGB
		const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = L - 0.0894841775 * a - 1.291485548 * b;

		const l = l_ * l_ * l_;
		const m = m_ * m_ * m_;
		const s = s_ * s_ * s_;

		const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
		const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
		const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

		const toSrgb = (x: number) =>
			Math.max(0, Math.min(1, x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
		const toHex = (x: number) =>
			Math.round(toSrgb(x) * 255)
				.toString(16)
				.padStart(2, '0');

		return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
	}

	function hexToOklch(hex: string): string {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;

		const toLinear = (x: number) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
		const lr = toLinear(r),
			lg = toLinear(g),
			lb = toLinear(b);

		// linear sRGB → Oklab
		const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
		const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
		const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

		const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
		const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
		const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

		const C = Math.sqrt(a * a + bk * bk);
		let H = Math.atan2(bk, a) * (180 / Math.PI);
		if (H < 0) H += 360;

		return `${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)}`;
	}

	let saving = $state(false);

	async function saveColor(hex: string) {
		saving = true;
		const oklch = hexToOklch(hex);
		const formData = new FormData();
		formData.set('primary_color', oklch);
		await fetch('?/setColor', { method: 'POST', body: formData });
		await invalidateAll();
		saving = false;
	}

	async function clearColor() {
		saving = true;
		const formData = new FormData();
		formData.set('primary_color', '');
		await fetch('?/setColor', { method: 'POST', body: formData });
		await invalidateAll();
		saving = false;
	}
</script>

<Section sectionId="club-detail">
	<div class="flex items-center gap-4">
		{#if data.club.profileImageUrl}
			<img src={data.club.profileImageUrl} alt={data.club.name} class="h-16 w-16 rounded-full" />
		{/if}
		<div class="flex-1">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				{data.club.name}
			</div>
			<Badge variant="outline" class="mt-2">{data.membership.role}</Badge>
		</div>
		{#if data.membership.role === 'admin'}
			<form method="POST" action="?/resync" use:enhance>
				<button type="submit" class="btn btn-sm btn-outline">Resync vo Strava</button>
			</form>
		{/if}
	</div>

	{#if form && 'error' in form && form.error}
		<div class="alert alert-error mt-4"><span>{form.error}</span></div>
	{:else if form && 'success' in form && form.success}
		<div class="alert alert-success mt-4"><span>Club isch aktualisiert worde.</span></div>
	{/if}

	{#if data.club.description}
		<p class="text-base-content/60 mt-4 text-lg">{data.club.description}</p>
	{/if}

	{#if data.membership.role === 'admin'}
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-bold">Club Farb</h2>
			<div class="flex items-center gap-4">
				<input
					type="color"
					value={data.club.primaryColor ? oklchToHex(data.club.primaryColor) : '#6d28d9'}
					onchange={(e) => saveColor(e.currentTarget.value)}
					class="h-10 w-10 cursor-pointer rounded-full border-none p-0"
					disabled={saving}
				/>
				{#if data.club.primaryColor}
					<span class="text-base-content/60 font-mono text-sm">
						oklch({data.club.primaryColor})
					</span>
					<button
						type="button"
						class="btn btn-xs btn-secondary"
						onclick={clearColor}
						disabled={saving}
					>
						Zruggsetze
					</button>
				{:else}
					<span class="text-base-content/40 text-sm">Standard-Farb</span>
				{/if}
				{#if saving}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
			</div>
		</div>
	{/if}

	<div class="mt-10">
		<h2 class="mb-4 text-xl font-bold">Members ({data.members.length})</h2>
		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.members as member (member.userId)}
				<Card.Root>
					<Card.Body class="flex-row items-center gap-3">
						{#if member.profile}
							<img
								src={member.profile}
								alt="{member.firstName} {member.lastName}"
								class="h-10 w-10 rounded-full"
							/>
						{:else}
							<div
								class="bg-base-300 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
							>
								{member.firstName?.charAt(0) ?? '?'}
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="truncate font-medium">
								{member.firstName}
								{member.lastName}
							</div>
							{#if member.role === 'admin'}
								<Badge variant="secondary" class="mt-0.5">Admin</Badge>
							{/if}
						</div>
					</Card.Body>
				</Card.Root>
			{/each}
		</div>
	</div>
</Section>
