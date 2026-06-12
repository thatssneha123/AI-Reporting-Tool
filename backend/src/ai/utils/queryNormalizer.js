const QUERY_SYNONYMS = {
  revenue: [
    "sales",
    "sales amount",
    "income",
    "turnover"
  ],

  quantity: [
    "qty",
    "units",
    "units sold"
  ]
};

function normalizeQuery(query) {
  let normalized = query.toLowerCase();

  for (const [standard, aliases] of Object.entries(QUERY_SYNONYMS)) {
    aliases.forEach(alias => {
      normalized = normalized.replaceAll(alias, standard);
    });
  }

  return normalized;
}

module.exports = {
  normalizeQuery
};