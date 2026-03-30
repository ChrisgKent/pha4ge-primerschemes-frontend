<script>
	export let scheme;
	export let query;

	import { base } from '$app/paths';
	import StatusPill from '$lib/StatusPill.svelte';

	let author_num = 3;
</script>

<tr>
	<td>
		<a
			class="title"
			href={`${base}/detail/${scheme.name}/${scheme.amplicon_size}/${scheme.version}/?q=${query}`}
			><strong>{scheme.name} / {scheme.amplicon_size} / {scheme.version}</strong></a
		>
		<ul>
			{#if scheme.contributors.length > author_num}
				<li>
					<strong>contributors: </strong>{scheme.contributors.slice(0, author_num).join(', ')},
					<em data-tooltip={scheme.contributors.join(', ')}><i>et al.</i></em>
				</li>
			{:else}
				<li><strong>contributors: </strong>{scheme.contributors.join(', ')}</li>
			{/if}

			<li><strong>organisms: </strong>{scheme.target_organisms.join(', ')}</li>
			<li style="color:grey">{scheme.license}</li>
		</ul>
	</td>
	<td>
		<StatusPill status={scheme.status} />
	</td>
</tr>

<style>
	.title {
		font-size: 1.55rem;
		font-weight: 600;
		line-height: 1.2;
	}

	td a {
		color: var(--pico-primary);
		background-color: transparent;
		text-decoration: none;
	}

	td a:hover {
		color: var(--pico-secondary);
		background-color: transparent;
		text-decoration: underline;
		transition: 0.2s;
	}

	ul li {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	ul {
		padding-left: 0;
		margin: 0.2rem 0 0 0;
	}

	tr td {
		padding: 0.5rem 0.95rem;
		vertical-align: top;
		border-bottom: 1px solid rgba(95, 107, 119, 0.18);
		background-color: #ffffff;
	}

	tr td:last-child {
		width: 1%;
		white-space: nowrap;
		text-align: right;
	}

	tr td:first-child {
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
	}

	tr td:last-child {
		border-top-right-radius: 6px;
		border-bottom-right-radius: 6px;
	}

	ul li {
		color: #344150;
		font-size: 1rem;
	}

	ul li strong {
		color: #1f2f3b;
	}

	@media (max-width: 720px) {
		.title {
			font-size: 1.4rem;
		}

		tr td {
			display: block;
			padding: 0.5rem 0.95rem;
		}
	}
</style>
