<script lang="ts">
	import { MountainSnowIcon } from 'lucide-svelte';
	import Start from '$site/icons/finish.png';
	import Trophy from '$site/icons/trophy.png';

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

<ul class="list bg-base-100 rounded-box mt-12 shadow-md">
	{#each sortedByWins as entry, i}
		<li class="list-row">
			<div class="text-4xl font-thin tabular-nums opacity-30">
				{(i + 1).toString().padStart(2, '0')}
			</div>
			<div>
				<img class="rounded-box size-10" src={entry.profile} alt={entry.userName} />
			</div>
			<div class="list-col-grow">
				<div class="uppercase">{entry.userName}</div>
				<div class="flex items-center gap-2">
					<div class="flex items-center gap-2">
						<img src={Trophy} alt="trophy" class="h-6 w-6" />
						<div class="text-accent text-xl font-bold">{winForUser(entry.userId).length}</div>
					</div>
					<div class="flex items-center gap-2">
						<img src={Start} alt="start" class="h-6 w-6" />
						<div class="text-accent text-xl font-bold">{entry.attempts}</div>
					</div>
				</div>
			</div>
			<a class="btn btn-square btn-ghost" href={`/users/${entry.userId}`}>
				<MountainSnowIcon />
			</a>
		</li>
	{/each}
</ul>
