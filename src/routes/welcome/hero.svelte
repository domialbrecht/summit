<script lang="ts">
	import HeroSection1 from './sections/hero1.svelte';
	import HeroSection2 from './sections/hero2.svelte';
	import Stelvio from '$site/stelvio.jpg?enhanced';
	import Furka from '$site/furka.jpg?enhanced';
	import Tremola from '$site/tremola.jpg?enhanced';

	let scrollY = $state(0);
	let innerHeight = $state(0);
	function scaleValue(value: number, from: number[], to: number[]) {
		let scale = (to[1] - to[0]) / (from[1] - from[0]);
		let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
		return capped * scale + to[0];
	}
	const animateValue = (
		targetElement: HTMLDivElement,
		scrollPercentage: number[],
		animateRange: number[]
	) => {
		if (targetElement) {
			return scaleValue(
				((scrollY - targetElement.offsetTop) / targetElement.clientHeight) * 100,
				scrollPercentage,
				animateRange
			);
		}
		return 0;
	};

	let hero: HTMLDivElement | undefined = $state();
</script>

<svelte:window bind:scrollY bind:innerHeight />
<div>
	<div
		bind:this={hero}
		class="flex min-h-[350vh] max-w-[100vw] flex-col items-center justify-start xl:flex-row xl:items-start xl:justify-between"
	>
		<div class="shrink xl:w-1/2">
			<HeroSection1 />
			<div class="xl:h-[calc(20vh)]"></div>
			<HeroSection2 />
		</div>
		<div
			class="invisible sticky bottom-4 hidden w-[calc(100%-2rem)] shrink duration-700 lg:visible lg:-end-32 lg:bottom-auto lg:top-16 lg:flex lg:w-auto lg:!transform-none lg:overflow-x-hidden lg:overflow-y-clip lg:bg-transparent lg:pb-16 lg:pt-16"
			style={`${
				hero && scrollY < hero.clientHeight * 0.2 ? 'visibility: visible;' : ''
			}transform:translateY(${animateValue(hero, [17, 25], [120, 0])}%)`}
		>
			<div
				class="mx-auto origin-top overflow-visible will-change-auto [--rtl-reverse:1] [transform:scale(1)] max-[1279px]:![transform:translate3d(0,0,0)] lg:h-[32rem] lg:w-[50rem] lg:rounded-e-none"
				style={hero && `transform: scale(${animateValue(hero, [70, 100], [1, 1.5])})`}
			>
				<div class="inline-grid place-items-center items-end">
					<div
						class="z-[4] col-start-1 row-start-1 w-full shadow-sm will-change-auto max-[1279px]:![transform:translate3d(0,0,0)]"
						style={`transform:translate(calc(${animateValue(
							hero,
							[0, 30],
							[0, 250]
						)}px * var(--rtl-reverse)),${animateValue(hero, [0, 30], [0, -800])}px)`}
					>
						<enhanced:img src={Stelvio} alt="Stelvio pass" class="" />
					</div>
					<div
						class="z-[3] col-start-1 row-start-1 w-full translate-y-[5%] scale-95 shadow-sm will-change-auto max-[1279px]:![transform:translate3d(0,0,0)]"
						style={`transform:translate(calc(${animateValue(
							hero,
							[25, 50],
							[0, 250]
						)}px * var(--rtl-reverse)),${animateValue(hero, [25, 50], [0, -800])}px)`}
					>
						<enhanced:img src={Tremola} alt="Stelvio pass" class="" />
					</div>
					<div
						class=" z-[2] col-start-1 row-start-1 w-full shadow-sm will-change-auto max-[1279px]:![transform:translate3d(0,0,0)]"
						style={`transform:translate(calc(${animateValue(
							hero,
							[45, 70],
							[0, 250]
						)}px * var(--rtl-reverse)),${animateValue(hero, [45, 70], [0, -800])}px)`}
					>
						<enhanced:img src={Stelvio} alt="Stelvio pass" class="" />
					</div>
					<div class="z-[1] col-start-1 row-start-1 w-full">
						<enhanced:img src={Furka} alt="Furka pass" class="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
