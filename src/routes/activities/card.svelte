<script lang="ts">
	import type { Activity } from '$lib/server/db/schema';

	let { username, activity }: { username: string; activity: Activity } = $props();
</script>

<div class="card card-compact transition-all duration-200 hover:-translate-y-1 hover:bg-base-200">
	<figure>
		<img
			src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
			alt="Shoes"
		/>
	</figure>
	<div class="card-body">
		<h2 class="card-title">
			{activity.name}
			<div class="badge badge-secondary">NEW</div>
		</h2>
		<p>{username}</p>
		<div class="card-actions justify-end">
			<div class="badge badge-outline">Fashion</div>
			<div class="badge badge-outline">Products</div>
		</div>
	</div>
</div>
