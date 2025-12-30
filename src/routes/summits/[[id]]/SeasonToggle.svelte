<script lang="ts">
	let { showSeason = $bindable(false) } = $props();

	let loading = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	function onToggle() {
		clearTimeout(timeout);

		loading = true;

		timeout = setTimeout(() => {
			loading = false;
		}, 3000);
	}
</script>

<div class="bg-base-100 flex items-center gap-2 rounded-full px-4 py-2">
	{#if loading}
		<span class="loading loading-spinner text-accent"></span>
	{:else}
		<input
			type="checkbox"
			bind:checked={showSeason}
			onchange={onToggle}
			class="toggle toggle-accent"
		/>
	{/if}

	<span class="text-neutral text-sm uppercase">aktuelli Saison</span>
</div>
