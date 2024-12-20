<script lang="ts">
	import Hundred from '$site/icons/hundred.png';
	import Party from '$site/icons/party.png';
</script>

<div>
	<div class="max-w-[100vw] px-2 py-10 lg:px-10 xl:max-w-[50vw]">
		<div class="font-title text-center xl:text-start">
			<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none">
				<!--[-->don't re-invent <br />the wheel <br />every time<!--]-->
				<img
					loading="lazy"
					width="72"
					height="72"
					alt="yawing face emoji"
					src={Hundred}
					class="pointer-events-none inline-block h-[1em] w-[1em] align-bottom"
				/>
			</h2>
			<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
				<!--[-->In a Tailwind CSS project, you need to write utility class names for every element.
				Thousands of class names just to style the most basic elements.<!--]-->
			</p>
			<div class="h-40"></div>
			<div class="relative h-[100vh]">
				<div class="sticky top-[16vh] xl:top-[30vh]">
					<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none">
						<!--[-->instead of writing<br />
						<span class="text-primary"><span class="font-black">100</span> class names</span
						><!--]-->
					</h2>
					<div class="h-6"></div>
					<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
						<!--[-->For every element, every page, every project,<br />again and again<!--]-->…
					</p>
					<div class="h-24"></div>
				</div>
			</div>
			<div class="relative h-screen">
				<div class="sticky top-[16vh] xl:top-[30vh]">
					<h2 class="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-none">
						<!--[-->use
						<span class="text-primary"
							><span class="font-black">semantic</span> <br />class names</span
						><!--]-->
						<img
							loading="lazy"
							width="72"
							height="72"
							alt="sunglasses emoji"
							src={Party}
							class="pointer-events-none inline-block h-[1em] w-[1em] align-bottom"
						/>
					</h2>
					<div class="h-6"></div>
					<p class="font-title py-4 font-light text-base-content/70 md:text-2xl">
						<!--[-->It's descriptive, faster, cleaner and easier to maintain.<!--]-->
					</p>
					<div class="h-20"></div>
				</div>
			</div>
		</div>
	</div>
</div>
