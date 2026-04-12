<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Trophy from '$site/icons/trophy.png';
	import Finish from '$site/icons/finish.png';
	import Section from '$lib/components/ui/section';
	import { dt } from '$lib/utils';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';

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
		goto(`/activities?${params.toString()}`, { invalidateAll: true });
	}
</script>

<Section sectionId="postsync">
	<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
		<span class="text-primary">Aktivitäte</span> vom SolyVC
	</div>

	<div class="mt-4 mb-6 flex flex-wrap gap-4">
		<select class="select select-bordered" value={selectedKey} onchange={onMonthChange}>
			{#each data.availableMonths as m}
				<option value={`${m.year}-${m.month}`}>{MONTH_NAMES[m.month - 1]} {m.year}</option>
			{/each}
		</select>
	</div>

	{#if data.activities.length > 0}
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Mitglied</th>
						<th>Name</th>
						<th>Datum</th>
						<th>Pass Trophäe</th>
					</tr>
				</thead>
				<tbody>
					{#each data.activities as activity (activity.attemptId)}
						<tr>
							<td>
								<div class="flex items-center gap-3">
									<div class="avatar">
										<div class="mask mask-squircle h-12 w-12">
											<img src={activity.profile} alt={activity.firstName} />
										</div>
									</div>
									<div>
										<div class="font-bold">{activity.firstName}</div>
									</div>
								</div>
							</td>
							<td>
								<a class="link-primary" href={`/summits/${activity.id}`}>{activity.name}</a>
							</td>
							<th>
								<span class="">{dt(activity.date)}</span>
							</th>
							<td>
								{#if activity.win}
									<img src={Trophy} alt="trophy" class="h-8 w-8" />
								{:else}
									<img src={Finish} alt="finish" class="h-8 w-8" />
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="mt-4 text-gray-400">Keni Aktivitäte für die Ziit.</p>
	{/if}
</Section>
