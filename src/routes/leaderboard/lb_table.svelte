<script lang="ts">
	type LeaderboardTable = {
		attempts: {
			userId: string;
			userName: string | null;
			profile: string | null;
			attempts: number;
		}[];
		wins: {
			userName: string | null;
			winAttempt: {
				date: Date;
				id: number;
				summitId: number;
				userId: string;
				activityId: string;
				published: boolean;
			} | null;
			summitName: string | null;
		}[];
	};
	let { leaderboard }: { leaderboard: LeaderboardTable } = $props();

	function winForUser(userId: string) {
		return leaderboard.wins.filter((win) => win.winAttempt?.userId === userId);
	}

	let sortedByWins = $derived.by(() => {
		return leaderboard.attempts.sort((a, b) => {
			return winForUser(b.userId).length - winForUser(a.userId).length;
		});
	});
</script>

<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th>Rang</th>
				<th>Name</th>
				<th>Päss</th>
				<th>Trophäe</th>
			</tr>
		</thead>
		<tbody>
			{#each sortedByWins as entry, i}
				<tr>
					<td>{i + 1}</td>
					<td>
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="mask mask-squircle h-12 w-12">
									<img src={entry.profile} alt={entry.userName} />
								</div>
							</div>
							<div>
								<a class="font-bold text-primary" href={`/users/${entry.userId}`}
									>{entry.userName}</a
								>
							</div>
						</div>
					</td>
					<th>
						<span class="badge badge-ghost badge-sm">{entry.attempts}</span>
					</th>
					<th>
						<span class="badge badge-primary badge-sm">{winForUser(entry.userId).length}</span>
					</th>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
