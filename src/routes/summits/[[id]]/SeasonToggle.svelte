<script lang="ts">
	import CalendarDays from 'lucide-svelte/icons/calendar-days';

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

<div class="bg-base-100 flex items-center gap-2 rounded-full px-2 py-1.5 shadow-lg lg:px-4 lg:py-2">
	{#if loading}
		<span class="loading loading-spinner loading-sm text-accent"></span>
	{:else}
		<input
			type="checkbox"
			bind:checked={showSeason}
			onchange={onToggle}
			class="toggle toggle-accent toggle-sm"
		/>
	{/if}

	<CalendarDays size={16} class="text-neutral" />
	<span class="text-neutral hidden text-sm uppercase lg:inline">aktuelli Saison</span>
</div>
