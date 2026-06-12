const COLUMN_SYNONYMS = {
  revenue: [
    "revenue",
    "sales",
    "sales_amount",
    "amount",
    "income",
    "turnover"
  ],

  quantity: [
    "quantity",
    "qty",
    "units",
    "units_sold"
  ],

  date: [
    "date",
    "transaction_date",
    "order_date",
    "sales_date"
  ],

  region: [
    "region",
    "location",
    "area",
    "zone"
  ]
};

function mapColumns(columns) {
  const mapping = {};

  for (const [standardName, aliases] of Object.entries(COLUMN_SYNONYMS)) {
    const found = columns.find(col =>
      aliases.includes(col.toLowerCase())
    );

    if (found) {
      mapping[standardName] = found;
    }
  }

  return mapping;
}

module.exports = {
  mapColumns
};