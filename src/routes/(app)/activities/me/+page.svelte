<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Section from '$lib/components/ui/section';
	import type { PageServerData } from './$types';
	import { dt, km } from '$lib/utils';
	import { goto } from '$app/navigation';

	const { data }: { data: PageServerData } = $props();

	const MONTH_NAMES = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];

	const selectedKey = $derived(`${data.selectedYear}-${data.selectedMonth}`);

	function onMonthChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		if (!value) return;
		const [year, month] = value.split('-');
		const params = new URLSearchParams();
		params.set('year', year);
		params.set('month', month);
		goto(`/activities/me?${params.toString()}`, { invalidateAll: true });
	}
</script>

<Section sectionId="postsync">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		<span class="text-primary">Aktivitäte</span> im System
	</div>
	<p class="mt-2 mb-2 max-w-2xl">
		Hie gsehsch aui Aktivitäte womer gsynched hei. Und die wo e Pass isch erkennt worde hei es "Pass
		erledigt" Zeiche. Falls was dire Meinig nach nid stimmt nim Kontakt uf.
	</p>

	<div class="mt-4 mb-6 flex flex-wrap gap-4">
		<select class="select select-bordered" value={selectedKey} onchange={onMonthChange}>
			{#each data.availableMonths as m}
				<option value={`${m.year}-${m.month}`}>{MONTH_NAMES[m.month - 1]} {m.year}</option>
			{/each}
		</select>
	</div>

	{#if data.activities.length > 0}
		<div class="mt-6 grid gap-6 xl:grid-cols-12">
			{#each data.activities as activity (activity.id)}
				<div class="xl:col-span-4">
					<a
						class={`card card-bordered border-2 shadow-xl transition-transform hover:-translate-y-2 ${activity.match ? 'border-primary' : ''}`}
						href={`/activities/me/${activity.id}`}
					>
						<div class="card-body">
							<h3 class="text-2xl font-black">{activity.name}</h3>
							{#if activity.match}
								<div class="badge badge-primary">Pass erledigt</div>
							{/if}
							<div class="card-content">
								<div class="card-actions mt-2">
									<div class="badge badge-outline badge-lg">{dt(activity.start)}</div>
									{#if activity.distance}
										<div class="badge badge-outline badge-lg">{km(activity.distance)}</div>
									{/if}
								</div>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-lg font-bold">
			<span class="text-primary">Nix gfunde,</span> versuech mau e sync
		</p>
		<p class="mt-4 mb-8">Falls was dire Mieinig nach nid stimmt, bitte nimm Kontakt mit nis uf.</p>
		<div class=""><Button href="/">Zrügg zur Homesite</Button></div>
	{/if}
</Section>
