<script>
	export let pageCount;
	export let pageNum;
	export let resultCount;
	export let pageSize;

	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let updateURLPageNum = async (newPageNum) => {
		let uriSearchParams = new URLSearchParams($page.url.searchParams.toString());
		uriSearchParams.set('pageNum', String(newPageNum));
		await goto(`${base}/?${uriSearchParams.toString()}`, {
			keepFocus: true
		});
	};
</script>

<nav data-sveltekit-reload>
	<p>Showing {pageSize} of {resultCount} results</p>
	<ul>
		{#each Array(pageCount) as _, i}
			<li>
				{#if i + 1 == pageNum}
					<button
						on:click={() => {
							updateURLPageNum(i + 1);
						}}>{i + 1}</button
					>
				{:else}
					<button
						class="outline"
						on:click={() => {
							updateURLPageNum(i + 1);
						}}>{i + 1}</button
					>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 0.3rem 0.2rem;
	}
	nav ul {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		margin: 0 20px;
		flex-wrap: wrap;
	}
	nav ul li {
		list-style: none;
		margin: 0 5px;
	}

	@media (max-width: 720px) {
		nav {
			flex-direction: column;
			align-items: flex-start;
		}

		nav ul {
			margin: 0;
		}
	}
</style>
