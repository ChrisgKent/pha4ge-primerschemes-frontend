<script>
	import { base } from '$app/paths';
</script>

<main>
	<h1>About</h1>
	<article>
		<p>
			The number of primer schemes is increasing rapidly, so we have built this site to make it
			easier to find pha4ge primer schemes and track their status. You can request that your scheme
			be tracked to enable other users to see it.
		</p>
		<p>
			The coloured status bar will indicate the development state of the scheme (see <a
				href="{base}/faqs">FAQ</a
			> for more information). Clicking on a scheme displays several new plots, scheme details, BED file
			and the reference(s). If you are logged in you can comment and engage with other users using Github
			Discussions.
		</p>
	</article>
</main>

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.2rem;
		line-height: 1.5;
		margin-bottom: 1rem;
	}
</style>
