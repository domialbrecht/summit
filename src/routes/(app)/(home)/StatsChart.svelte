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
	import { BarChart, type BarSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { SVGRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';

	type StatPoint = { date: Date; attempts: number; trophies: number };
	let { chartData }: { chartData: StatPoint[] } = $props();
	let chartContainer: HTMLDivElement;

	echarts.use([
		TooltipComponent,
		GridComponent,
		LegendComponent,
		BarChart,
		SVGRenderer,
		UniversalTransition
	]);

	type EChartsOption = echarts.ComposeOption<
		TooltipComponentOption | GridComponentOption | LegendComponentOption | BarSeriesOption
	>;

	onMount(() => {
		const chart = echarts.init(chartContainer);

		const styles = getComputedStyle(document.documentElement);
		const primary = styles.getPropertyValue('--color-primary').trim();
		const base300 = styles.getPropertyValue('--color-base-300').trim();

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

		// Count per-month attempts and trophy wins (not cumulative)
		const monthlyAttempts: number[] = Array(12).fill(0);
		const monthlyTrophies: number[] = Array(12).fill(0);
		let prevTrophies = 0;
		for (const d of chartData) {
			const m = new Date(d.date).getMonth();
			monthlyAttempts[m]++;
			if (d.trophies > prevTrophies) {
				monthlyTrophies[m]++;
				prevTrophies = d.trophies;
			}
		}

		const option: EChartsOption = {
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ['Trophäe', 'Päss'],
				bottom: 0
			},
			grid: {
				left: 40,
				right: 16,
				top: 16,
				bottom: 40
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
					type: 'bar',
					data: monthlyTrophies,
					barGap: '20%',
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: `oklch(from ${primary} l c h / 1)` },
							{ offset: 1, color: `oklch(from ${primary} l c h / 0.4)` }
						]),
						borderRadius: [4, 4, 0, 0]
					}
				},
				{
					name: 'Päss',
					type: 'bar',
					data: monthlyAttempts,
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: `oklch(from ${base300} l c h / 1)` },
							{ offset: 1, color: `oklch(from ${base300} l c h / 0.4)` }
						]),
						borderRadius: [4, 4, 0, 0]
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
