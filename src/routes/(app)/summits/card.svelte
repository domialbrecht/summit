<script lang="ts">
	import type { Activity } from '$lib/server/db/schema';

	let { username, activity }: { username: string; activity: Activity } = $props();
</script>

<div class="card card-compact transition-all duration-200 hover:-translate-y-1 hover:bg-base-200">
	<div class="card-body">
		<h2 class="card-title">
			{activity.name}
			<div class="badge badge-secondary">NEW</div>
		</h2>
		<p>{username}</p>
		<div class="card-actions justify-end">
			<div class="badge badge-outline">{activity.averageWatts} W</div>
			<div class="badge badge-outline">
				{(parseFloat(activity.distance || '0') / 1000).toFixed(2)} KM
			</div>
		</div>
	</div>
</div>
