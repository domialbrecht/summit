<script lang="ts">
	import Check from '$site/icons/check.png';
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root variant="border">
	<Card.Body>
		<Card.Content>
			<div class="flex items-center gap-2">
				<img src={Check} alt="Trophy" class="h-12 w-12" />
				<div class="font-bold">Pass frei!! Schnapp in dir!</div>
			</div>
		</Card.Content>
	</Card.Body>
</Card.Root>
