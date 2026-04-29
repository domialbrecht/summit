<script lang="ts">
	import type { Club } from '$lib/server/db/schema';

	let {
		activeClub,
		userClubs
	}: {
		activeClub: Club | null;
		userClubs: Array<{ club: Club; role: string }>;
	} = $props();
</script>

{#if userClubs.length > 1}
	<li>
		<details class="dropdown dropdown-end">
			<summary
				class="tooltip list-none"
				data-tip={activeClub?.name ?? 'Global'}
				aria-label="Club wechsle"
			>
				{#if activeClub?.profileImageUrl}
					<img
						src={activeClub.profileImageUrl}
						alt={activeClub.name}
						class="h-5 w-5 rounded-full"
					/>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-5 w-5"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20" />
						<path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						/>
					</svg>
				{/if}
			</summary>
			<ul class="dropdown-content menu bg-base-100 rounded-box z-50 mt-4 w-52 p-2 shadow-lg">
				<li class="menu-title text-xs">Club wechsle</li>
				<form method="POST" action="/clubs/switch" class="contents">
					<li>
						<button
							type="submit"
							name="club_id"
							value=""
							class={!activeClub ? 'bg-secondary text-secondary-content' : ''}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-4 w-4"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M2 12h20" />
								<path
									d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
								/>
							</svg>
							<span class="flex-1 text-left">Global</span>
							{#if !activeClub}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-primary h-4 w-4"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					</li>
					{#each userClubs as { club } (club.id)}
						{@const isActive = activeClub?.id === club.id}
						<li>
							<button
								type="submit"
								name="club_id"
								value={club.id}
								class={isActive ? 'bg-secondary text-secondary-content' : ''}
							>
								{#if club.profileImageUrl}
									<img src={club.profileImageUrl} alt={club.name} class="h-4 w-4 rounded-full" />
								{/if}
								<span class="flex-1 text-left">{club.name}</span>
								{#if isActive}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="text-primary h-4 w-4"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						</li>
					{/each}
				</form>
				<li class="border-base-300 mt-1 border-t pt-1">
					<a href="/clubs" onclick={(e) => { e.currentTarget.closest('details')?.removeAttribute('open'); }}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
						Alle Clubs
					</a>
				</li>
			</ul>
		</details>
	</li>
{:else if userClubs.length === 1}
	<li>
		<a
			href="/clubs/{userClubs[0].club.slug}"
			class="tooltip"
			data-tip={userClubs[0].club.name}
			aria-label={userClubs[0].club.name}
		>
			{#if userClubs[0].club.profileImageUrl}
				<img
					src={userClubs[0].club.profileImageUrl}
					alt={userClubs[0].club.name}
					class="h-5 w-5 rounded-full"
				/>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-5 w-5"
				>
					<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
					<path d="M16 3.13a4 4 0 0 1 0 7.75" />
				</svg>
			{/if}
		</a>
	</li>
{/if}
