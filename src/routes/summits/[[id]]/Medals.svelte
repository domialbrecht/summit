<script lang="ts">
	import Medal1 from '$site/icons/medal1.png';
	import Medal2 from '$site/icons/medal2.png';
	import Medal3 from '$site/icons/medal3.png';

	type Medals = { username: string | null; attempts: number; rank: unknown }[];

	let { medals }: { medals: Medals } = $props();

	function getMedalIcon(rank: string) {
		switch (parseInt(rank)) {
			case 1:
				return Medal1;
			case 2:
				return Medal2;
			case 3:
				return Medal3;
			default:
				return Medal1;
		}
	}
</script>

<div class="flex flex-col gap-2">
	{#each medals as medal}
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center justify-between gap-3">
				<div class="avatar">
					<div class="mask mask-squircle h-6 w-6 lg:h-12 lg:w-12">
						<img src={getMedalIcon(medal.rank as string)} alt="Trophy" />
					</div>
				</div>
				<span class="font-bold">{medal.username}</span>
			</div>
			<div class="flex gap-3">
				<div class="badge badge-accent">Pass ufstige: {medal.attempts}</div>
			</div>
		</div>
	{/each}
</div>
