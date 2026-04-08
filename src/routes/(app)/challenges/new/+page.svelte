<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Section from '$lib/components/ui/section';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { page } from '$app/stores';
	import ChallengeEditor, { type EditorMode } from '$lib/components/map/challenge-editor.svelte';
	import { CHALLENGE_COLORS as COLORS } from '$lib/components/map/challenge-colors';
	import {
		Undo2,
		Redo2,
		Hand,
		Crosshair,
		MountainSnow,
		ChevronUp,
		ChevronDown,
		Search,
		Zap,
		CalendarDays
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Fuse from 'fuse.js';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form);

	type Point = {
		lat: number;
		long: number;
		name: string;
		description: string;
		summitId?: number;
		elevation?: number;
	};

	// Undo/redo history
	let history = $state<Point[][]>([[]]);
	let historyIndex = $state(0);

	let points = $derived(history[historyIndex]);

	function pushHistory(newPoints: Point[]) {
		history = [...history.slice(0, historyIndex + 1), newPoints];
		historyIndex = history.length - 1;
	}

	function undo() {
		if (historyIndex > 0) historyIndex--;
	}
	function redo() {
		if (historyIndex < history.length - 1) historyIndex++;
	}

	function handleKeydown(e: KeyboardEvent) {
		const mod = e.ctrlKey || e.metaKey;
		if (mod && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			undo();
		}
		if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
			e.preventDefault();
			redo();
		}
	}

	$effect(() => {
		$form.pointsJson = JSON.stringify(points);
	});

	// Map editor mode
	let mode = $state<EditorMode>('place');

	// Ordered toggle
	let ordered = $state(false);
	$effect(() => {
		$form.ordered = ordered ? 'true' : '';
	});

	// Challenge type
	let challengeType = $state<'one_time' | 'seasonal'>('one_time');
	$effect(() => {
		$form.type = challengeType;
		if (challengeType === 'seasonal') {
			ordered = false;
		}
	});

	// Bidirectional selection
	let selectedIndex = $state<number | null>(null);
	let flyToTarget = $state<{ lat: number; long: number } | null>(null);

	// Auto-scroll
	let itemEls = $state<(HTMLDivElement | null)[]>([]);
	$effect(() => {
		if (selectedIndex !== null) {
			itemEls[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	});

	function selectPoint(i: number) {
		selectedIndex = i;
		const pt = points[i];
		if (pt) flyToTarget = { lat: pt.lat, long: pt.long };
	}

	function addPoint(p: { lat: number; long: number }) {
		const newIndex = points.length;
		pushHistory([...points, { lat: p.lat, long: p.long, name: '', description: '' }]);
		selectedIndex = newIndex;
	}

	function addSummit(s: {
		summitId: number;
		name: string;
		lat: number;
		long: number;
		elevation: number | null;
	}) {
		// Don't add duplicate summits
		if (points.some((p) => p.summitId === s.summitId)) return;
		const newIndex = points.length;
		pushHistory([
			...points,
			{
				lat: s.lat,
				long: s.long,
				name: s.name,
				description: '',
				summitId: s.summitId,
				elevation: s.elevation ?? undefined
			}
		]);
		selectedIndex = newIndex;
	}

	function removePoint(i: number) {
		pushHistory(points.filter((_, j) => j !== i));
		if (selectedIndex !== null) {
			if (selectedIndex >= i) selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : null;
		}
	}

	function movePoint(i: number, dir: -1 | 1) {
		const target = i + dir;
		if (target < 0 || target >= points.length) return;
		const updated = [...points];
		[updated[i], updated[target]] = [updated[target], updated[i]];
		pushHistory(updated);
		selectedIndex = target;
	}

	function updatePoint(i: number, patch: Partial<Point>) {
		const updated = points.map((p, j) => (j === i ? { ...p, ...patch } : p));
		history = [...history.slice(0, historyIndex), updated, ...history.slice(historyIndex + 1)];
	}

	// Summit search
	type SummitItem = { id: number; name: string; alias: string; lat: number; long: number };
	let fuse: Fuse<SummitItem> | undefined;
	let searchQuery = $state('');
	let searchResults = $derived.by(() => {
		if (!fuse || searchQuery.trim().length < 2) return [];
		return fuse.search(searchQuery, { limit: 8 }).map((r) => r.item);
	});

	onMount(async () => {
		const res = await fetch('/summits/index');
		if (res.ok) {
			const index = await res.json();
			fuse = new Fuse(index, {
				keys: ['name', 'alias'],
				includeScore: true,
				threshold: 0.3
			});
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<Section sectionId="newChallenge">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		<span class="text-primary">Nöii</span> Challange
	</div>

	{#if $message}
		<div role="alert" class="alert mt-4 mb-4" class:alert-warning={$page.status >= 400}>
			<span>{$message}</span>
		</div>
	{/if}

	<form method="POST" use:enhance class="mt-6 grid gap-6 xl:grid-cols-12">
		<div class="flex flex-col gap-4 xl:col-span-5">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Name</legend>
				<Input
					name="name"
					placeholder="Challange Name"
					aria-invalid={$errors.name ? 'true' : undefined}
					bind:value={$form.name}
				/>
				{#if $errors.name}<span class="label text-error">{$errors.name}</span>{/if}
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">Beschriebig (optional)</legend>
				<Textarea
					name="description"
					placeholder="Kurzi Beschriebig vo der Challange..."
					rows={3}
					bind:value={$form.description}
				/>
				{#if $errors.description}<span class="label text-error">{$errors.description}</span>{/if}
			</fieldset>

			<input type="hidden" name="pointsJson" bind:value={$form.pointsJson} />
			<input type="hidden" name="ordered" bind:value={$form.ordered} />
			<input type="hidden" name="type" bind:value={$form.type} />
			{#if $errors.pointsJson}
				<span class="label text-error">{$errors.pointsJson}</span>
			{/if}

			<!-- Type selector -->
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Typ</legend>
				<div class="flex gap-2">
					<button
						type="button"
						class="btn btn-sm gap-1"
						class:btn-primary={challengeType === 'one_time'}
						class:btn-outline={challengeType !== 'one_time'}
						onclick={() => (challengeType = 'one_time')}
					>
						<Zap size={14} /> Einmalig
					</button>
					<button
						type="button"
						class="btn btn-sm gap-1"
						class:btn-primary={challengeType === 'seasonal'}
						class:btn-outline={challengeType !== 'seasonal'}
						onclick={() => (challengeType = 'seasonal')}
					>
						<CalendarDays size={14} /> Saisonal
					</button>
				</div>
				<p class="text-base-content/50 mt-1 text-xs">
					{#if challengeType === 'one_time'}
						Aui Punkte müese i eire Aktivität erreicht werde.
					{:else}
						Punkte chöi über mehreri Aktivitäte i dere Saison gsammlet werde.
					{/if}
				</p>
			</fieldset>

			<!-- Options row -->
			<label class="label cursor-pointer gap-2" class:opacity-40={challengeType === 'seasonal'}>
				<span class="label-text">Feschti Reihefolg</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={ordered}
					disabled={challengeType === 'seasonal'}
				/>
			</label>

			<!-- Mode toggle + undo/redo toolbar -->
			<div class="flex flex-wrap items-center gap-2">
				<div class="join">
					<button
						class="btn btn-sm join-item"
						class:btn-primary={mode === 'drag'}
						type="button"
						onclick={() => (mode = 'drag')}
						title="Verschiebe (Pan)"><Hand size={16} /></button
					>
					<button
						class="btn btn-sm join-item"
						class:btn-primary={mode === 'select'}
						type="button"
						onclick={() => (mode = 'select')}
						title="Gipfel uswähle"><MountainSnow size={16} /></button
					>
					<button
						class="btn btn-sm join-item"
						class:btn-primary={mode === 'place'}
						type="button"
						onclick={() => (mode = 'place')}
						title="Punkt setze"><Crosshair size={16} /></button
					>
				</div>
				<div class="join">
					<button
						class="btn btn-secondary btn-sm join-item"
						type="button"
						disabled={historyIndex === 0}
						onclick={undo}
						title="Undo (⌘Z)"><Undo2 size={16} /></button
					>
					<button
						class="btn btn-secondary btn-sm join-item"
						type="button"
						disabled={historyIndex >= history.length - 1}
						onclick={redo}
						title="Redo (⌘⇧Z)"><Redo2 size={16} /></button
					>
				</div>
				{#if points.length > 0}
					<span class="text-base-content/50 ml-auto text-xs"
						>{points.length} Punkt{points.length !== 1 ? 'e' : ''}</span
					>
				{/if}
			</div>

			<!-- Summit search (visible in select mode) -->
			{#if mode === 'select'}
				<div class="relative">
					<div class="relative">
						<Search
							size={16}
							class="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2"
						/>
						<input
							type="text"
							class="input input-sm w-full pl-9"
							placeholder="Gipfel sueche..."
							bind:value={searchQuery}
						/>
					</div>
					{#if searchResults.length > 0}
						<ul
							class="menu bg-base-200 rounded-box absolute z-10 mt-1 max-h-48 w-full overflow-y-auto shadow-lg"
						>
							{#each searchResults as s (s.id)}
								<li>
									<button
										type="button"
										class="flex items-center gap-2"
										onclick={() => {
											addSummit({
												summitId: s.id,
												name: s.name,
												lat: s.lat,
												long: s.long,
												elevation: null
											});
											searchQuery = '';
											flyToTarget = { lat: s.lat, long: s.long };
										}}
									>
										<MountainSnow size={14} />
										<span>{s.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
			<!-- Points list (scrollable) -->
			{#if points.length > 0}
				<div class="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
					{#each points as point, i (i)}
						<div
							bind:this={itemEls[i]}
							role="button"
							tabindex="0"
							class="rounded-box flex cursor-pointer flex-col gap-2 border p-3 transition-colors"
							class:border-primary={selectedIndex === i}
							class:bg-base-200={selectedIndex === i}
							class:border-base-300={selectedIndex !== i}
							onclick={() => selectPoint(i)}
							onkeydown={(e) => e.key === 'Enter' && selectPoint(i)}
						>
							<div class="flex items-center gap-2">
								{#if ordered}
									<span class="badge badge-sm badge-neutral font-mono">{i + 1}</span>
								{/if}
								<span
									class="inline-block h-3 w-3 shrink-0 rounded-full border border-white shadow-sm"
									style="background:{COLORS[i % COLORS.length]}"
								></span>
								{#if point.summitId}
									<MountainSnow size={14} class="text-primary shrink-0" />
								{/if}
								<span class="text-base-content/60 font-mono text-xs"
									>{point.lat.toFixed(5)}, {point.long.toFixed(5)}</span
								>
								<div class="ml-auto flex items-center gap-0.5">
									{#if ordered}
										<button
											class="btn btn-secondary btn-xs"
											type="button"
											disabled={i === 0}
											onclick={(e: MouseEvent) => {
												e.stopPropagation();
												movePoint(i, -1);
											}}
											title="Ufe"><ChevronUp size={14} /></button
										>
										<button
											class="btn btn-secondary btn-xs"
											type="button"
											disabled={i === points.length - 1}
											onclick={(e: MouseEvent) => {
												e.stopPropagation();
												movePoint(i, 1);
											}}
											title="Abe"><ChevronDown size={14} /></button
										>
									{/if}
									<Button
										variant="secondary"
										size="sm"
										type="button"
										onclick={(e: MouseEvent) => {
											e.stopPropagation();
											removePoint(i);
										}}>✕</Button
									>
								</div>
							</div>
							<Input
								placeholder="Name (optional)"
								value={point.name}
								type="text"
								disabled={!!point.summitId}
								oninput={(e: Event) =>
									updatePoint(i, { name: (e.currentTarget as HTMLInputElement).value })}
							/>
							<Textarea
								placeholder="Beschriebig (optional)"
								value={point.description}
								rows={2}
								oninput={(e: Event) =>
									updatePoint(i, { description: (e.currentTarget as HTMLTextAreaElement).value })}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-base-content/60 text-sm">Klick uf der Map um Punkte z erfasse.</p>
			{/if}

			<Button type="submit" disabled={$delayed || points.length === 0}>
				{$delayed ? 'Speichere...' : 'Challange erstelle'}
			</Button>
		</div>

		<div class="rounded-box h-[500px] min-h-[400px] overflow-hidden xl:col-span-7">
			<ChallengeEditor
				bind:selectedIndex
				bind:mode
				{flyToTarget}
				{points}
				onPointAdded={addPoint}
				onSummitSelected={addSummit}
			/>
		</div>
	</form>
</Section>
