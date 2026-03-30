import { expect, test } from '@playwright/test';

const INDEX_URL = 'https://raw.githubusercontent.com/quick-lab/primerschemes/main/index.json';
const ALIASES_URL = 'https://raw.githubusercontent.com/quick-lab/primerschemes/main/aliases.json';

const CACHE_KEYS = {
	flatSchemes: 'catalog-cache:v1:flat-schemes',
	aliases: 'catalog-cache:v1:aliases'
};

const JSON_HEADERS = {
	'access-control-allow-origin': '*',
	'content-type': 'application/json'
};
const TEXT_HEADERS = {
	'access-control-allow-origin': '*',
	'content-type': 'text/plain'
};

const BASE_INDEX = {
	primerschemes: {
		'virus-a': {
			400: {
				'1.0.0': {
					schemename: 'virus-a',
					ampliconsize: 400,
					schemeversion: '1.0.0',
					status: 'validated',
					description: 'validated respiratory scheme',
					authors: ['Alice'],
					species: ['Virus a'],
					license: 'CC-BY-4.0',
					collections: ['respiratory'],
					info_json_url: 'https://example.test/virus-a/400/1.0.0/info.json',
					primer_bed_url: 'https://example.test/virus-a/400/1.0.0/primer.bed',
					reference_fasta_url: 'https://example.test/virus-a/400/1.0.0/reference.fasta'
				}
			}
		}
	}
};

const BASE_ALIASES = {
	alpha_alias: 'virus-a'
};

const INFO_JSON = {
	algorithmversion: 'primalscheme2:2.1.0',
	description: 'mock detail metadata'
};

const BED_TEXT = [
	'# mock bedfile',
	'chr1\t0\t22\tAMP_1_LEFT\t1\t+',
	'chr1\t78\t100\tAMP_1_RIGHT\t1\t-'
].join('\n');
const REFERENCE_FASTA = ['>chr1', 'ACGTACGTACGTACGT'].join('\n');

const clone = (value) => JSON.parse(JSON.stringify(value));

async function mockCatalogRoutes(target, { failIndex = false, failAliases = false } = {}) {
	let indexRequests = 0;
	let aliasesRequests = 0;

	await target.route(INDEX_URL, (route) => {
		indexRequests += 1;
		if (failIndex) return route.abort('failed');
		return route.fulfill({
			status: 200,
			headers: JSON_HEADERS,
			body: JSON.stringify(clone(BASE_INDEX))
		});
	});

	await target.route(ALIASES_URL, (route) => {
		aliasesRequests += 1;
		if (failAliases) return route.abort('failed');
		return route.fulfill({
			status: 200,
			headers: JSON_HEADERS,
			body: JSON.stringify(clone(BASE_ALIASES))
		});
	});

	return {
		getIndexRequests: () => indexRequests,
		getAliasesRequests: () => aliasesRequests
	};
}

async function mockCatalogRoutesWithData(
	target,
	{
		indexData = BASE_INDEX,
		aliasesData = BASE_ALIASES,
		failIndex = false,
		failAliases = false
	} = {}
) {
	let indexRequests = 0;
	let aliasesRequests = 0;

	await target.route(INDEX_URL, (route) => {
		indexRequests += 1;
		if (failIndex) return route.abort('failed');
		return route.fulfill({
			status: 200,
			headers: JSON_HEADERS,
			body: JSON.stringify(clone(indexData))
		});
	});

	await target.route(ALIASES_URL, (route) => {
		aliasesRequests += 1;
		if (failAliases) return route.abort('failed');
		return route.fulfill({
			status: 200,
			headers: JSON_HEADERS,
			body: JSON.stringify(clone(aliasesData))
		});
	});

	return {
		getIndexRequests: () => indexRequests,
		getAliasesRequests: () => aliasesRequests
	};
}

const FACET_INDEX = {
	primerschemes: {
		'scheme-alpha': {
			700: {
				'1.0.0': {
					schemename: 'scheme-alpha',
					ampliconsize: 700,
					schemeversion: '1.0.0',
					status: 'validated',
					description: 'alpha scheme',
					authors: ['Alice'],
					species: ['Species A'],
					license: 'CC-BY-4.0',
					collections: ['c1'],
					info_json_url: 'https://example.test/scheme-alpha/700/1.0.0/info.json',
					primer_bed_url: 'https://example.test/scheme-alpha/700/1.0.0/primer.bed',
					reference_fasta_url: 'https://example.test/scheme-alpha/700/1.0.0/reference.fasta'
				}
			}
		},
		'scheme-beta': {
			400: {
				'1.0.0': {
					schemename: 'scheme-beta',
					ampliconsize: 400,
					schemeversion: '1.0.0',
					status: 'validated',
					description: 'beta scheme',
					authors: ['Bob'],
					species: ['Species B'],
					license: 'CC-BY-4.0',
					collections: ['c1'],
					info_json_url: 'https://example.test/scheme-beta/400/1.0.0/info.json',
					primer_bed_url: 'https://example.test/scheme-beta/400/1.0.0/primer.bed',
					reference_fasta_url: 'https://example.test/scheme-beta/400/1.0.0/reference.fasta'
				}
			}
		},
		'scheme-gamma': {
			700: {
				'1.0.0': {
					schemename: 'scheme-gamma',
					ampliconsize: 700,
					schemeversion: '1.0.0',
					status: 'validated',
					description: 'gamma scheme',
					authors: ['Carol'],
					species: [37124],
					license: 'CC-BY-4.0',
					collections: ['c2'],
					info_json_url: 'https://example.test/scheme-gamma/700/1.0.0/info.json',
					primer_bed_url: 'https://example.test/scheme-gamma/700/1.0.0/primer.bed',
					reference_fasta_url: 'https://example.test/scheme-gamma/700/1.0.0/reference.fasta'
				}
			}
		}
	}
};

const facetOptions = async (page, facetTitle) => {
	const facet = page
		.locator('aside.sidebar .facet')
		.filter({ has: page.locator('legend h6', { hasText: facetTitle }) })
		.first();
	return (await facet.locator('label.checkbox-row span').allTextContents()).map((text) =>
		text.trim()
	);
};

async function mockSchemeAssets(page) {
	await page.route('https://example.test/**', (route) => {
		const url = route.request().url();
		if (url.endsWith('/info.json')) {
			return route.fulfill({
				status: 200,
				headers: JSON_HEADERS,
				body: JSON.stringify(clone(INFO_JSON))
			});
		}
		if (url.endsWith('/primer.bed')) {
			return route.fulfill({
				status: 200,
				headers: TEXT_HEADERS,
				body: BED_TEXT
			});
		}
		if (url.endsWith('/reference.fasta')) {
			return route.fulfill({
				status: 200,
				headers: TEXT_HEADERS,
				body: REFERENCE_FASTA
			});
		}
		return route.fulfill({
			status: 404,
			headers: TEXT_HEADERS,
			body: 'not found'
		});
	});
}

test('home then detail in same tab reuses in-memory index cache', async ({ page }) => {
	const counters = await mockCatalogRoutes(page);
	await mockSchemeAssets(page);

	await page.goto('/');
	await expect(page.getByText('virus-a / 400 / 1.0.0')).toBeVisible();

	await page.goto('/detail/virus-a/400/1.0.0/');
	await expect(page.getByRole('heading', { name: 'virus-a / 400 / 1.0.0' })).toBeVisible();

	expect(counters.getIndexRequests()).toBe(1);
	expect(counters.getAliasesRequests()).toBe(1);
});

test('new page load within ttl uses localStorage cache without refetch', async ({ context }) => {
	const counters = await mockCatalogRoutes(context);

	const firstPage = await context.newPage();
	await firstPage.goto('/');
	await expect(firstPage.getByText('virus-a / 400 / 1.0.0')).toBeVisible();
	await firstPage.close();

	const secondPage = await context.newPage();
	await secondPage.goto('/');
	await expect(secondPage.getByText('virus-a / 400 / 1.0.0')).toBeVisible();

	expect(counters.getIndexRequests()).toBe(1);
	expect(counters.getAliasesRequests()).toBe(1);
});

test('expired cache fallback renders home results and stale warning when upstream fails', async ({
	page
}) => {
	const staleFlatSchemes = [
		{
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: '1.0.0',
			status: 'validated',
			description: 'stale cached scheme',
			authors: ['Alice'],
			species: ['Virus a'],
			license: 'CC-BY-4.0',
			collections: ['respiratory'],
			aliases: [],
			info_json_url: 'https://example.test/virus-a/400/1.0.0/info.json',
			primer_bed_url: 'https://example.test/virus-a/400/1.0.0/primer.bed',
			reference_fasta_url: 'https://example.test/virus-a/400/1.0.0/reference.fasta'
		}
	];
	const expiredAt = 0;

	await page.addInitScript(
		({ flatSchemesKey, aliasesKey, flatSchemes, aliases, fetchedAt }) => {
			window.localStorage.setItem(flatSchemesKey, JSON.stringify({ data: flatSchemes, fetchedAt }));
			window.localStorage.setItem(aliasesKey, JSON.stringify({ data: aliases, fetchedAt }));
		},
		{
			flatSchemesKey: CACHE_KEYS.flatSchemes,
			aliasesKey: CACHE_KEYS.aliases,
			flatSchemes: staleFlatSchemes,
			aliases: BASE_ALIASES,
			fetchedAt: expiredAt
		}
	);

	await mockCatalogRoutes(page, { failIndex: true, failAliases: true });
	await page.goto('/');

	await expect(page.getByText('virus-a / 400 / 1.0.0')).toBeVisible();
	await expect(
		page.getByText(
			'Using cached catalog data; upstream refresh failed. Data may be up to 2+ minutes old.'
		)
	).toBeVisible();
	await expect(page.getByText('Unable to load schemes data...')).not.toBeVisible();
});

test('no cache and upstream failure keeps home error state', async ({ page }) => {
	await mockCatalogRoutes(page, { failIndex: true, failAliases: true });
	await page.goto('/');
	await expect(page.getByText('Unable to load schemes data...')).toBeVisible();
});

test('detail page shows stale warning when stale index cache is used', async ({ page }) => {
	const staleFlatSchemes = [
		{
			schemename: 'virus-a',
			ampliconsize: 400,
			schemeversion: '1.0.0',
			status: 'validated',
			description: 'stale cached scheme',
			authors: ['Alice'],
			species: ['Virus a'],
			license: 'CC-BY-4.0',
			collections: ['respiratory'],
			aliases: [],
			info_json_url: 'https://example.test/virus-a/400/1.0.0/info.json',
			primer_bed_url: 'https://example.test/virus-a/400/1.0.0/primer.bed',
			reference_fasta_url: 'https://example.test/virus-a/400/1.0.0/reference.fasta'
		}
	];

	await page.addInitScript(
		({ flatSchemesKey, flatSchemes, fetchedAt }) => {
			window.localStorage.setItem(flatSchemesKey, JSON.stringify({ data: flatSchemes, fetchedAt }));
		},
		{
			flatSchemesKey: CACHE_KEYS.flatSchemes,
			flatSchemes: staleFlatSchemes,
			fetchedAt: 0
		}
	);

	await mockCatalogRoutes(page, { failIndex: true, failAliases: true });
	await mockSchemeAssets(page);
	await page.goto('/detail/virus-a/400/1.0.0/');

	await expect(page.getByRole('heading', { name: 'virus-a / 400 / 1.0.0' })).toBeVisible();
	await expect(
		page.getByText(
			'Using cached catalog data; upstream refresh failed. Data may be up to 2+ minutes old.'
		)
	).toBeVisible();
});

test('amplicon filter updates visible species and authors facets', async ({ page }) => {
	await mockCatalogRoutesWithData(page, { indexData: FACET_INDEX, aliasesData: {} });
	await page.goto('/?ampliconsize=700');
	await expect(page.getByText('scheme-alpha / 700 / 1.0.0')).toBeVisible();

	const species = await facetOptions(page, 'Species');
	const authors = await facetOptions(page, 'Authors');

	expect(species).toContain('Species A (1)');
	expect(species).toContain('37124 (1)');
	expect(species).not.toContain('Species B (1)');
	expect(authors).toContain('Alice (1)');
	expect(authors).toContain('Carol (1)');
	expect(authors).not.toContain('Bob (1)');
});

test('author filter updates visible species and amplicon facets', async ({ page }) => {
	await mockCatalogRoutesWithData(page, { indexData: FACET_INDEX, aliasesData: {} });
	await page.goto('/?author=Alice');
	await expect(page.getByText('scheme-alpha / 700 / 1.0.0')).toBeVisible();

	const species = await facetOptions(page, 'Species');
	const amplicons = await facetOptions(page, 'Amplicon Size');

	expect(species).toEqual(['Species A (1)']);
	expect(amplicons).toEqual(['700 (1)']);
});

test('species filter updates visible authors and amplicon facets', async ({ page }) => {
	await mockCatalogRoutesWithData(page, { indexData: FACET_INDEX, aliasesData: {} });
	await page.goto('/?species=Species%20A');
	await expect(page.getByText('scheme-alpha / 700 / 1.0.0')).toBeVisible();

	const authors = await facetOptions(page, 'Authors');
	const amplicons = await facetOptions(page, 'Amplicon Size');

	expect(authors).toEqual(['Alice (1)']);
	expect(amplicons).toEqual(['700 (1)']);
});

test('selected unmatched species remains visible for deselection path', async ({ page }) => {
	await mockCatalogRoutesWithData(page, { indexData: FACET_INDEX, aliasesData: {} });
	await page.goto('/?author=Bob&species=37124');
	await expect(page.getByText('No results')).toBeVisible();

	const species = await facetOptions(page, 'Species');

	expect(species).toContain('37124 (0)');
	expect(species).toContain('Species B (1)');
});
