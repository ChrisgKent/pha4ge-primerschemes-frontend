export const flattenedSchemeIndex = (schemeIndex) => {
	const flatSchemes = [];

	for (const schemeName in schemeIndex.primerschemes) {
		const schemeKeyedBySize = schemeIndex.primerschemes[schemeName];
		for (const size in schemeKeyedBySize) {
			const schemeKeyedByVersion = schemeIndex.primerschemes[schemeName][size];
			for (const version in schemeKeyedByVersion) {
				const scheme = schemeIndex.primerschemes[schemeName][size][version];
				// Normalize structured arrays to flat string arrays
				scheme.contributors = (scheme.contributors ?? []).map((c) => c.name);
				scheme.target_organisms = (scheme.target_organisms ?? []).map((o) => o.common_name);
				// Normalize status to lowercase
				scheme.status = (scheme.status ?? '').toLowerCase();
				// Initialize aliases (no separate aliases.json in pha4ge repo)
				scheme.aliases = [];
				flatSchemes.push({
					...scheme
				});
			}
		}
	}
	return flatSchemes;
};
