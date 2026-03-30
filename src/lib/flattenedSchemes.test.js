import { describe, expect, it } from 'vitest';
import { flattenedSchemeIndex } from './flattenedSchemes.js';

describe('flattenedSchemeIndex', () => {
	it('flattens nested scheme index into one array item per scheme version', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'v1.0.0': {
							name: 'virus-a',
							amplicon_size: 400,
							version: 'v1.0.0',
							status: 'VALIDATED',
							contributors: [{ name: 'Alice' }],
							target_organisms: [{ common_name: 'virus-a' }],
							tags: []
						},
						'v2.0.0': {
							name: 'virus-a',
							amplicon_size: 400,
							version: 'v2.0.0',
							status: 'DRAFT',
							contributors: [{ name: 'Alice' }],
							target_organisms: [{ common_name: 'virus-a' }],
							tags: []
						}
					}
				},
				'virus-b': {
					500: {
						'v1.0.0': {
							name: 'virus-b',
							amplicon_size: 500,
							version: 'v1.0.0',
							status: 'DEPRECATED',
							contributors: [{ name: 'Bob' }],
							target_organisms: [{ common_name: 'virus-b' }],
							tags: []
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened).toHaveLength(3);
		expect(flattened.map((scheme) => scheme.name)).toEqual(['virus-a', 'virus-a', 'virus-b']);
		expect(flattened.map((scheme) => scheme.version)).toEqual(['v1.0.0', 'v2.0.0', 'v1.0.0']);
	});

	it('normalizes contributors and target_organisms to flat string arrays', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'v1.0.0': {
							name: 'virus-a',
							amplicon_size: 400,
							version: 'v1.0.0',
							status: 'DRAFT',
							contributors: [{ name: 'Alice' }, { name: 'Bob' }],
							target_organisms: [{ common_name: 'sars-cov-2' }],
							tags: []
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened[0].contributors).toEqual(['Alice', 'Bob']);
		expect(flattened[0].target_organisms).toEqual(['sars-cov-2']);
	});

	it('normalizes status to lowercase', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'v1.0.0': {
							name: 'virus-a',
							amplicon_size: 400,
							version: 'v1.0.0',
							status: 'DRAFT',
							contributors: [],
							target_organisms: [],
							tags: []
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened[0].status).toBe('draft');
	});

	it('initializes aliases to an empty array per flattened entry', () => {
		const schemeIndex = {
			primerschemes: {
				'virus-a': {
					400: {
						'v1.0.0': {
							name: 'virus-a',
							amplicon_size: 400,
							version: 'v1.0.0',
							status: 'VALIDATED',
							contributors: [],
							target_organisms: [],
							tags: []
						}
					}
				},
				'virus-b': {
					500: {
						'v1.0.0': {
							name: 'virus-b',
							amplicon_size: 500,
							version: 'v1.0.0',
							status: 'DEPRECATED',
							contributors: [],
							target_organisms: [],
							tags: []
						}
					}
				}
			}
		};

		const flattened = flattenedSchemeIndex(schemeIndex);

		expect(flattened[0].aliases).toEqual([]);
		expect(flattened[1].aliases).toEqual([]);
		expect(flattened[0].aliases).not.toBe(flattened[1].aliases);
	});

	it('returns an empty array when no schemes are present', () => {
		const flattened = flattenedSchemeIndex({ primerschemes: {} });
		expect(flattened).toEqual([]);
	});
});
