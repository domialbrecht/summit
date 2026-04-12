<script lang="ts">
	type StatPoint = { date: Date; attempts: number; trophies: number };

	let {
		stats,
		seasonStart,
		seasonEnd
	}: {
		stats: StatPoint[];
		seasonStart: Date;
		seasonEnd: Date;
	} = $props();

	const CELL = 13;
	const GAP = 3;
	const SIZE = CELL + GAP;
	const DAYS = ['Mo', '', 'Mi', '', 'Fr', '', 'So'];
	const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

	// Build day map: dateStr -> { summits, trophies }
	const dayMap = new Map<string, { summits: number; trophies: number }>();
	let prevTrophies = 0;
	for (const s of stats) {
		const key = new Date(s.date).toISOString().slice(0, 10);
		const existing = dayMap.get(key);
		const newTrophies = s.trophies > prevTrophies ? s.trophies - prevTrophies : 0;
		prevTrophies = s.trophies;
		if (existing) {
			existing.summits++;
			existing.trophies += newTrophies;
		} else {
			dayMap.set(key, { summits: 1, trophies: newTrophies });
		}
	}

	// Build week grid from season start to season end
	const start = new Date(seasonStart);
	const end = new Date(seasonEnd);

	// Align to Monday of the start week
	const startDay = start.getDay(); // 0=Sun
	const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
	const gridStart = new Date(start);
	gridStart.setDate(gridStart.getDate() + mondayOffset);

	type Cell = {
		date: string;
		dayOfWeek: number; // 0=Mon
		weekIndex: number;
		summits: number;
		trophies: number;
		inSeason: boolean;
	};

	const cells: Cell[] = [];
	const weekMonthLabels: { weekIndex: number; label: string }[] = [];
	let currentDate = new Date(gridStart);
	let weekIndex = 0;
	let lastMonth = -1;

	while (currentDate <= end || currentDate.getDay() !== 1) {
		if (currentDate > end && currentDate.getDay() === 1) break;

		const dow = currentDate.getDay();
		const dayOfWeek = dow === 0 ? 6 : dow - 1; // Mon=0, Sun=6

		if (dayOfWeek === 0 && cells.length > 0) {
			weekIndex++;
		}

		const month = currentDate.getMonth();
		if (month !== lastMonth && dayOfWeek <= 3) {
			weekMonthLabels.push({ weekIndex, label: MONTHS[month] });
			lastMonth = month;
		}

		const key = currentDate.toISOString().slice(0, 10);
		const data = dayMap.get(key);
		const inSeason = currentDate >= start && currentDate <= end;

		cells.push({
			date: key,
			dayOfWeek,
			weekIndex,
			summits: data?.summits ?? 0,
			trophies: data?.trophies ?? 0,
			inSeason
		});

		currentDate.setDate(currentDate.getDate() + 1);
	}

	const totalWeeks = weekIndex + 1;
	const svgWidth = 28 + totalWeeks * SIZE + 8;
	const svgHeight = 20 + 7 * SIZE + 4;

	function cellColor(cell: Cell): string {
		if (!cell.inSeason) return '#f3f4f6'; // gray-100
		if (cell.trophies > 0) {
			// Trophy days: red scale
			if (cell.trophies >= 3) return '#991b1b'; // red-800
			if (cell.trophies === 2) return '#dc2626'; // red-600
			return '#f87171'; // red-400
		}
		if (cell.summits >= 3) return '#16a34a'; // green-600
		if (cell.summits === 2) return '#4ade80'; // green-400
		if (cell.summits === 1) return '#86efac'; // green-300
		return '#e5e7eb'; // gray-200 - no activity
	}

	let tooltip = $state<{ x: number; y: number; text: string } | null>(null);

	function showTooltip(e: MouseEvent, cell: Cell) {
		if (!cell.inSeason) return;
		const d = new Date(cell.date);
		const dateStr = d.toLocaleDateString('de-CH', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
		let text = dateStr;
		if (cell.summits === 0) {
			text += ' — keni Aktivität';
		} else {
			text += ` — ${cell.summits} Pass${cell.summits > 1 ? '' : ''}`;
			if (cell.trophies > 0) {
				text += `, ${cell.trophies} Trophäe`;
			}
		}
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		tooltip = { x: rect.left + rect.width / 2, y: rect.top - 8, text };
	}

	function hideTooltip() {
		tooltip = null;
	}
</script>

<div class="relative w-full overflow-x-auto">
	<svg
		viewBox="0 0 {svgWidth} {svgHeight}"
		class="w-full"
		style="min-width: {Math.min(svgWidth, 600)}px"
	>
		<!-- Day labels -->
		{#each DAYS as label, i}
			{#if label}
				<text
					x="12"
					y={20 + i * SIZE + CELL - 2}
					text-anchor="end"
					class="fill-gray-400"
					style="font-size: 9px">{label}</text
				>
			{/if}
		{/each}

		<!-- Month labels -->
		{#each weekMonthLabels as ml}
			<text
				x={28 + ml.weekIndex * SIZE}
				y="10"
				text-anchor="start"
				class="fill-gray-400"
				style="font-size: 9px">{ml.label}</text
			>
		{/each}

		<!-- Cells -->
		{#each cells as cell}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<rect
				x={28 + cell.weekIndex * SIZE}
				y={18 + cell.dayOfWeek * SIZE}
				width={CELL}
				height={CELL}
				rx="2"
				fill={cellColor(cell)}
				onmouseenter={(e) => showTooltip(e, cell)}
				onmouseleave={hideTooltip}
			/>
		{/each}
	</svg>

	{#if tooltip}
		<div
			class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow"
			style="left: {tooltip.x}px; top: {tooltip.y}px"
		>
			{tooltip.text}
		</div>
	{/if}

	<!-- Legend -->
	<div class="mt-1 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-gray-400">
		<div class="flex items-center gap-1">
			<span>Päss:</span>
			<span class="inline-block h-3 w-3 rounded-sm bg-gray-200"></span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #86efac"></span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #4ade80"></span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #16a34a"></span>
		</div>
		<div class="flex items-center gap-1">
			<span>Trophäe:</span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #f87171"></span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #dc2626"></span>
			<span class="inline-block h-3 w-3 rounded-sm" style="background: #991b1b"></span>
		</div>
	</div>
</div>
