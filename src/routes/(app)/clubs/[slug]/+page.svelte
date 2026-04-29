<script lang="ts">
	import Section from '$lib/components/ui/section';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<Section sectionId="club-detail">
	<div class="flex items-center gap-4">
		{#if data.club.profileImageUrl}
			<img src={data.club.profileImageUrl} alt={data.club.name} class="h-16 w-16 rounded-full" />
		{/if}
		<div class="flex-1">
			<div class="font-title text-[clamp(1.5rem,6vw,4rem)] leading-none font-black">
				{data.club.name}
			</div>
			<Badge variant="outline" class="mt-2">{data.membership.role}</Badge>
		</div>
		{#if data.membership.role === 'admin'}
			<form method="POST" action="?/resync" use:enhance>
				<button type="submit" class="btn btn-sm btn-outline">Resync vo Strava</button>
			</form>
		{/if}
	</div>

	{#if form && 'error' in form && form.error}
		<div class="alert alert-error mt-4"><span>{form.error}</span></div>
	{:else if form && 'success' in form && form.success}
		<div class="alert alert-success mt-4"><span>Club isch aktualisiert worde.</span></div>
	{/if}

	{#if data.club.description}
		<p class="text-base-content/60 mt-4 text-lg">{data.club.description}</p>
	{/if}

	<div class="mt-10">
		<h2 class="mb-4 text-xl font-bold">Members ({data.members.length})</h2>
		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.members as member (member.userId)}
				<Card.Root>
					<Card.Body class="flex-row items-center gap-3">
						{#if member.profile}
							<img
								src={member.profile}
								alt="{member.firstName} {member.lastName}"
								class="h-10 w-10 rounded-full"
							/>
						{:else}
							<div
								class="bg-base-300 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
							>
								{member.firstName?.charAt(0) ?? '?'}
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="truncate font-medium">
								{member.firstName}
								{member.lastName}
							</div>
							{#if member.role === 'admin'}
								<Badge variant="secondary" class="mt-0.5">Admin</Badge>
							{/if}
						</div>
					</Card.Body>
				</Card.Root>
			{/each}
		</div>
	</div>
</Section>
