<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Trophy from '$site/icons/trophy.png';
	import Finish from '$site/icons/finish.png';
	import Section from '$lib/components/ui/section';
	import { dt } from '$lib/utils';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<Section sectionId="postsync">
	{#if data.activities.length > 0}
		<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
			<span class="text-primary">Aktivitäte</span> vom SolyVC
		</div>
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
					{#each data.activities as activity}
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
								<span class="badge badge-ghost badge-sm">{dt(activity.date)}</span>
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
		<div>
			{#if data.offset > 50}
				<a href={`?offset=${data.offset - 50 < 0 ? 0 : data.offset - 50}`} class="btn btn-primary"
					>Vorherigi Site</a
				>
			{/if}
			{#if data.activities.length === 50}
				<a href={`?offset=${data.offset + 50}`} class="btn btn-primary">Witeri Site</a>
			{/if}
		</div>
	{:else}
		{#if data.offset > 0}
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] font-black leading-none">
				<span class="text-primary">Keni Date</span> meh ab hie
			</div>
		{/if}
		<div class="mt-2"><Button href="/activities">Zum Start</Button></div>
	{/if}
</Section>
