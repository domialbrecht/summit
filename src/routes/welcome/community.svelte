<script lang="ts">
	import type { User } from '$lib/server/db/schema';

	let { users }: { users: Promise<User[]> } = $props();
</script>

<div class="w-full overflow-hidden px-2 py-24 lg:px-10">
	<div class="text-center">
		<div class="h-6"></div>
		<div>
			<img
				loading="lazy"
				width="80"
				height="80"
				alt="heart emoji"
				class="pointer-events-none inline-block h-24 w-24 align-bottom"
				src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Woman%20Biking%20Medium-Light%20Skin%20Tone.png"
			/>
			<img
				loading="lazy"
				width="80"
				height="80"
				alt="heart emoji"
				class="pointer-events-none inline-block h-24 w-24 align-bottom"
				src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Man%20Biking%20Medium%20Skin%20Tone.png"
			/>
			<img
				loading="lazy"
				width="80"
				height="80"
				alt="heart emoji"
				class="pointer-events-none inline-block h-24 w-24 align-bottom"
				src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Man%20Biking%20Medium%20Skin%20Tone.png"
			/>
			<img
				loading="lazy"
				width="80"
				height="80"
				alt="heart emoji"
				class="pointer-events-none inline-block h-24 w-24 align-bottom"
				src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Woman%20Biking%20Medium%20Skin%20Tone.png"
			/>
			<img
				loading="lazy"
				width="80"
				height="80"
				alt="heart emoji"
				class="pointer-events-none inline-block h-24 w-24 align-bottom"
				src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Woman%20Biking%20Medium-Light%20Skin%20Tone.png"
			/>
		</div>
		<div class="h-12"></div>
		<h2
			class="font-title relative z-2 mx-auto text-[clamp(2rem,6vw,4.5rem)] font-black leading-none"
		>
			SolyVC Rennvelo Event<br />
			{#await users then db_users}
				<span class="font-light text-primary">{db_users.length} aktivi Mitglider</span>
			{/await}
		</h2>
		<div class="h-6"></div>
		<div class="flex w-full justify-center">
			<div class="flex w-full max-w-5xl flex-wrap justify-center gap-3 p-10">
				{#await users then db_users}
					{#each db_users as user}
						<!-- content here -->
						<div class="tooltip" data-tip={`${user.firstName} ${user.lastName}`}>
							<div class="avatar">
								<div class="mask mask-squircle w-12">
									<img
										loading="lazy"
										width="64"
										height="64"
										class="pointer-events-none transition-all duration-500 ease-in-out"
										alt={user.firstName}
										src={user.profile}
									/>
								</div>
							</div>
						</div>
					{/each}
				{/await}
			</div>
		</div>
	</div>
</div>
