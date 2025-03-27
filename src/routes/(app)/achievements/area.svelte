<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	const {
		area,
		total,
		done
	}: {
		area: {
			id: number;
			name: string;
		};
		total: number;
		done: number;
	} = $props();
	const completion = $derived(Math.ceil((done / total) * 100));
	const color = $derived.by(() => {
		if (completion === 100) {
			return 'bg-green-400 animate-bounce';
		}

		if (completion === 0) {
			return 'bg-base-200';
		} else if (completion < 50) {
			return 'bg-primary';
		} else {
			return 'bg-green-400';
		}
	});
</script>

<div class="xl:col-span-4">
	<a
		class={`card card-bordered border-2 shadow-xl transition-transform hover:-translate-y-2`}
		href={`/achievements/areas/${area.id}`}
	>
		<div class="card-body items-center justify-center">
			<Card.Title>{area.name}</Card.Title>
			<Card.Content>
				<div class="flex w-full items-center gap-2">
					<progress class="progress progress-primary grow" value={completion} max="100"></progress>
					<div class={`badge text-white ${color}`}>{completion}%</div>
				</div>
				<span class="font-bold">{done}/{total}</span>
			</Card.Content>
		</div>
	</a>
</div>
