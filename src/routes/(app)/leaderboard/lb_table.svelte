<script lang="ts">
	import type { LeaderboardData } from '$lib/types';

	let { leaderboard }: { leaderboard: LeaderboardData[] } = $props();
</script>

<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th>Rang</th>
				<th>Name</th>
				<th>Päss</th>
				<th>Letzte Pass</th>
			</tr>
		</thead>
		<tbody>
			{#each leaderboard as entry, i}
				<tr>
					<td>{i + 1}</td>
					<td>
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="mask mask-squircle h-12 w-12">
									<img src={entry.userProfile} alt={entry.userName} />
								</div>
							</div>
							<div>
								<div class="font-bold">{entry.userName}</div>
							</div>
						</div>
					</td>
					<th>
						<span class="badge badge-ghost badge-sm">{entry.wins}</span>
					</th>
					<th>
						<a href={`/summits/${entry.lastSummitId}`} class="badge badge-primary badge-sm"
							>{entry.lastSummitWon}</a
						>
					</th>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
