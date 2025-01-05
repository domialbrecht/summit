<script lang="ts">
	import * as echarts from 'echarts/core';
	import {
		TitleComponent,
		type TitleComponentOption,
		TooltipComponent,
		type TooltipComponentOption,
		GridComponent,
		type GridComponentOption,
		VisualMapComponent,
		type VisualMapComponentOption
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { SVGRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';
	import { getColorFromGradient } from '$lib/utils';

	let { chartData }: { chartData: number[][] } = $props();
	let chartContainer: HTMLDivElement;

	echarts.use([
		TitleComponent,
		TooltipComponent,
		GridComponent,
		VisualMapComponent,
		LineChart,
		SVGRenderer,
		UniversalTransition
	]);

	type EChartsOption = echarts.ComposeOption<
		| TitleComponentOption
		| TooltipComponentOption
		| GridComponentOption
		| VisualMapComponentOption
		| LineSeriesOption
	>;

	onMount(() => {
		var myChart = echarts.init(chartContainer);

		const chunkSize = 10;
		const segmentData = chartData.reduce((result: number[][][], item, index) => {
			const chunkIndex = Math.floor(index / chunkSize);
			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}
			result[chunkIndex].push(item);

			return result;
		}, []);

		function averageGradient(points: number[][]): number {
			const first = points[0];
			const last = points[points.length - 1];
			return ((last[1] - first[1]) / (last[0] - first[0])) * 100;
		}

		const option: EChartsOption = {
			xAxis: {
				type: 'value',
				min: function (value) {
					return Math.floor(value.min - 10);
				},
				max: function (value) {
					return Math.ceil(value.max + 10);
				}
			},
			yAxis: {
				type: 'value',
				splitNumber: 4, // Limit to 4 ticks
				axisLabel: {
					formatter: function (value) {
						return value.toFixed(0); // Show whole numbers only
					}
				},
				min: function (value) {
					return Math.floor(value.min / 100) * 100; // Round down to the nearest 100
				},
				max: function (value) {
					return Math.ceil(value.max / 100) * 100; // Round up to the nearest 100
				}
			},
			tooltip: {
				trigger: 'axis',
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				formatter: function (params: any) {
					const points = params[0];
					return `Distance: ${points.data[0].toFixed(0)} m<br>
	                 Elevation: ${points.data[1].toFixed(0)} m<br>
	                 Gradient: ${points.data[2].toFixed(2)}%`;
				}
			},
			series: [
				...segmentData.map((points) => {
					const average = averageGradient(points);
					const color = getColorFromGradient(average);
					return {
						type: 'line' as const,
						data: points.map((point) => [...point, average]),
						lineStyle: {
							width: 2,
							color: color
						},
						areaStyle: {
							opacity: 0.8,
							color: color
						},
						symbol: 'none'
					};
				}),
				{
					type: 'line' as const,
					data: chartData,
					silent: true,
					lineStyle: {
						width: 3,
						color: '#374151'
					},
					showSymbol: false
				}
			]
		};
		myChart.setOption(option);
	});
</script>

<div class="flex">
	<div class="h-64 w-full" bind:this={chartContainer}></div>
</div>
