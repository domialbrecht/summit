<script lang="ts">
	import * as echarts from 'echarts/core';
	import {
		TooltipComponent,
		type TooltipComponentOption,
		GridComponent,
		type GridComponentOption,
		LegendComponent,
		type LegendComponentOption
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { SVGRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';
	import type { ProgressComparison, ProgressPoint } from '$lib/server/db/functions';

	let { data }: { data: ProgressComparison } = $props();
	let chartContainer: HTMLDivElement;

	echarts.use([
		TooltipComponent,
		GridComponent,
		LegendComponent,
		LineChart,
		SVGRenderer,
		UniversalTransition
	]);

	type EChartsOption = echarts.ComposeOption<
		TooltipComponentOption | GridComponentOption | LegendComponentOption | LineSeriesOption
	>;

	function toMonthSeries(points: ProgressPoint[]): (number | null)[] {
		const arr: (number | null)[] = Array(12).fill(null);
		let last: number | null = null;
		for (let m = 0; m < 12; m++) {
			const p = points.find((pt) => pt.month === m);
			if (p) last = p.trophies;
			if (last !== null) arr[m] = last;
		}
		return arr;
	}

	function toMonthSeriesSummits(points: ProgressPoint[]): (number | null)[] {
		const arr: (number | null)[] = Array(12).fill(null);
		let last: number | null = null;
		for (let m = 0; m < 12; m++) {
			const p = points.find((pt) => pt.month === m);
			if (p) last = p.summits;
			if (last !== null) arr[m] = last;
		}
		return arr;
	}

	onMount(() => {
		const chart = echarts.init(chartContainer, undefined, { renderer: 'svg' });

		const months = [
			'Jan',
			'Feb',
			'Mär',
			'Apr',
			'Mai',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Okt',
			'Nov',
			'Dez'
		];

		const option: EChartsOption = {
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				bottom: 0,
				textStyle: { fontSize: 11 }
			},
			grid: {
				left: 40,
				right: 16,
				top: 16,
				bottom: 36
			},
			xAxis: {
				type: 'category',
				data: months,
				axisTick: { alignWithLabel: true }
			},
			yAxis: {
				type: 'value',
				minInterval: 1
			},
			series: [
				{
					name: 'Trophäe',
					type: 'line',
					data: toMonthSeries(data.user),
					connectNulls: true,
					symbol: 'circle',
					symbolSize: 6,
					lineStyle: { width: 3 },
					itemStyle: { color: '#e5384e' },
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(229, 56, 78, 0.25)' },
							{ offset: 1, color: 'rgba(229, 56, 78, 0.02)' }
						])
					}
				},
				{
					name: 'Päss',
					type: 'line',
					data: toMonthSeriesSummits(data.user),
					connectNulls: true,
					symbol: 'circle',
					symbolSize: 6,
					lineStyle: { width: 3 },
					itemStyle: { color: '#6b7280' },
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(107, 114, 128, 0.15)' },
							{ offset: 1, color: 'rgba(107, 114, 128, 0.02)' }
						])
					}
				}
			]
		};

		chart.setOption(option);

		const ro = new ResizeObserver(() => chart.resize());
		ro.observe(chartContainer);

		return () => {
			ro.disconnect();
			chart.dispose();
		};
	});
</script>

<div class="h-72 w-full" bind:this={chartContainer}></div>
