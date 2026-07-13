const path = require("path");
const { loadDataset } = require("./datasetLoader");
const typeUtils = require("../utils/typeDetector");

const SUPPORTED_EXTENSIONS = new Set([".csv", ".xls", ".xlsx"]);

const DOMAIN_RULES = [
  {
    domain: "Sales",
    keywords: ["sale", "sales", "revenue", "order", "customer", "deal", "invoice", "profit", "discount", "region", "rep"],
  },
  {
    domain: "Finance",
    keywords: ["transaction", "account", "balance", "debit", "credit", "expense", "income", "payment", "amount", "tax", "budget"],
  },
  {
    domain: "Retail",
    keywords: ["product", "sku", "store", "cart", "customer", "price", "quantity", "category", "brand", "purchase"],
  },
  {
    domain: "Movies",
    keywords: ["movie", "title", "director", "cast", "genre", "rating", "release", "duration", "show", "season"],
  },
  {
    domain: "Healthcare",
    keywords: ["patient", "doctor", "diagnosis", "treatment", "medicine", "hospital", "claim", "lab", "appointment", "blood"],
  },
  {
    domain: "HR",
    keywords: ["employee", "salary", "department", "attendance", "leave", "hire", "designation", "manager", "performance"],
  },
  {
    domain: "Inventory",
    keywords: ["inventory", "stock", "warehouse", "sku", "supplier", "reorder", "unit", "quantity", "item"],
  },
  {
    domain: "Grocery",
    keywords: ["grocery", "item", "food", "quantity", "amount", "milk", "bread", "rice", "maggi", "vegetable", "fruit"],
  },
  {
    domain: "Education",
    keywords: ["student", "course", "grade", "marks", "score", "teacher", "class", "subject", "attendance", "school"],
  },
];

const CURRENCY_KEYWORDS = [
  "amount",
  "price",
  "cost",
  "revenue",
  "sales",
  "profit",
  "salary",
  "expense",
  "income",
  "payment",
  "total",
  "bill",
  "tax",
  "fee",
  "charge",
  "balance",
];

const IDENTIFIER_KEYWORDS = [
  "id",
  "uuid",
  "code",
  "sku",
  "email",
  "phone",
  "mobile",
  "invoice",
  "order",
  "account",
  "transaction",
  "roll",
];

function analyzeDatasetIntelligence(rawDataset, options = {}) {
  if (!Array.isArray(rawDataset) || rawDataset.length === 0) {
    return {
      error: "Empty dataset",
      agent: "Dataset Intelligence Agent",
      version: "1.0.0",
    };
  }

  const dataset = normalizeRows(rawDataset);
  const columns = getColumns(dataset);
  const columnTypes = typeUtils.detectColumnTypes(dataset);
  const columnProfiles = profileColumns(dataset, columns, columnTypes);

  const numericalColumns = columnProfiles.filter((col) => col.role === "numeric").map((col) => col.name);
  const categoricalColumns = columnProfiles.filter((col) => col.role === "categorical").map((col) => col.name);
  const dateColumns = columnProfiles.filter((col) => col.role === "date").map((col) => col.name);
  const currencyColumns = columnProfiles.filter((col) => col.isCurrency).map((col) => col.name);
  const identifierColumns = columnProfiles.filter((col) => col.isIdentifier).map((col) => col.name);

  const missingValues = calculateMissingValues(columnProfiles);
  const duplicateRows = countDuplicateRows(dataset, columns);
  const domainResult = detectDomain(columns, dataset, options);
  const datasetType = inferDatasetType(domainResult.domain, {
    columns,
    numericalColumns,
    categoricalColumns,
    dateColumns,
    currencyColumns,
    identifierColumns,
  });

  const dataQualityScore = calculateDataQualityScore({
    rowCount: dataset.length,
    columnCount: columns.length,
    missingValues,
    duplicateRows,
    emptyColumnCount: columnProfiles.filter((col) => col.type === "empty").length,
  });

  const suggestions = buildSuggestions({
    domain: domainResult.domain,
    datasetType,
    numericalColumns,
    categoricalColumns,
    dateColumns,
    currencyColumns,
    identifierColumns,
  });

  return {
    agent: "Dataset Intelligence Agent",
    version: "1.0.0",
    source: {
      filename: options.filename || null,
      fileType: options.fileType || null,
    },
    dataset: {
      domain: domainResult.domain,
      domainConfidence: domainResult.confidence,
      domainSignals: domainResult.signals,
      inferredType: datasetType,
    },
    schema: {
      totalRows: dataset.length,
      totalColumns: columns.length,
      columns,
      numericalColumns,
      categoricalColumns,
      dateColumns,
      currencyColumns,
      identifierColumns,
      columnProfiles,
    },
    quality: {
      missingValues,
      duplicateRows,
      dataQualityScore,
    },
    suggestions,
  };
}

async function analyzeDatasetFile(filePath, options = {}) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return {
      error: `Unsupported file type for Dataset Intelligence Agent: ${ext}`,
      supportedFileTypes: Array.from(SUPPORTED_EXTENSIONS),
    };
  }

  const dataset = await loadDataset(filePath);
  return analyzeDatasetIntelligence(dataset, {
    ...options,
    filename: options.filename || path.basename(filePath),
    fileType: ext.replace(".", ""),
  });
}

function normalizeRows(rows) {
  return rows.filter((row) => row && typeof row === "object");
}

function getColumns(dataset) {
  const columnSet = new Set();
  for (const row of dataset) {
    Object.keys(row).forEach((column) => columnSet.add(column));
  }
  return Array.from(columnSet);
}

function profileColumns(dataset, columns, columnTypes) {
  return columns.map((name) => {
    const values = dataset.map((row) => row[name]);
    const nonMissingValues = values.filter((value) => !isMissing(value));
    const uniqueCount = new Set(nonMissingValues.map(normalizeValue)).size;
    const uniqueRatio = nonMissingValues.length ? uniqueCount / nonMissingValues.length : 0;
    const type = columnTypes[name] || "unknown";
    const isCurrency = detectCurrencyColumn(name, nonMissingValues);
    const isIdentifier = detectIdentifierColumn(name, nonMissingValues, uniqueRatio, type);
    const role = getColumnRole(type, isCurrency, isIdentifier);

    return {
      name,
      type,
      role,
      missingCount: values.length - nonMissingValues.length,
      missingPercent: values.length ? Number((((values.length - nonMissingValues.length) / values.length) * 100).toFixed(2)) : 0,
      uniqueCount,
      uniqueRatio: Number(uniqueRatio.toFixed(3)),
      isCurrency,
      isIdentifier,
      sampleValues: nonMissingValues.slice(0, 5),
    };
  });
}

function getColumnRole(type, isCurrency, isIdentifier) {
  if (isIdentifier) return "identifier";
  if (type === "datetime") return "date";
  if (isCurrency || type === "numeric") return "numeric";
  if (type === "categorical" || type === "boolean") return "categorical";
  return type;
}

function detectCurrencyColumn(columnName, values) {
  const normalizedName = normalizeText(columnName);
  const nameLooksCurrency = CURRENCY_KEYWORDS.some((keyword) => normalizedName.includes(keyword));
  const currencySymbolCount = values.filter((value) => /[$₹€£¥]/.test(String(value))).length;
  return nameLooksCurrency || (values.length > 0 && currencySymbolCount / values.length > 0.5);
}

function detectIdentifierColumn(columnName, values, uniqueRatio, type) {
  const normalizedName = normalizeText(columnName);
  if (type === "datetime" || /\b(date|time|year|month|day)\b/.test(normalizedName)) {
    return false;
  }

  const nameLooksIdentifier = IDENTIFIER_KEYWORDS.some((keyword) => {
    if (keyword === "id") return /\b(id|.*_id|.*id)\b/.test(normalizedName);
    return normalizedName.includes(keyword);
  });
  const mostlyUnique = values.length >= 10 && uniqueRatio > 0.92;
  const hasLongCodes = values.some((value) => /^[a-z0-9_-]{8,}$/i.test(String(value)));
  return nameLooksIdentifier || (mostlyUnique && hasLongCodes);
}

function calculateMissingValues(columnProfiles) {
  const byColumn = {};
  let totalMissing = 0;

  for (const column of columnProfiles) {
    byColumn[column.name] = {
      missing: column.missingCount,
      missingPercent: column.missingPercent,
    };
    totalMissing += column.missingCount;
  }

  return {
    totalMissing,
    byColumn,
  };
}

function countDuplicateRows(dataset, columns) {
  const seen = new Set();
  let duplicates = 0;

  for (const row of dataset) {
    const signature = JSON.stringify(columns.map((column) => normalizeValue(row[column])));
    if (seen.has(signature)) duplicates++;
    else seen.add(signature);
  }

  return duplicates;
}

function detectDomain(columns, dataset, options) {
  const text = [
    options.filename,
    ...columns,
    ...dataset.slice(0, 25).flatMap((row) => Object.values(row).slice(0, 8)),
  ].filter(Boolean).map(normalizeText).join(" ");

  const scores = DOMAIN_RULES.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => text.includes(keyword));
    return {
      domain: rule.domain,
      score: matchedKeywords.length,
      matchedKeywords,
    };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best || best.score === 0) {
    return {
      domain: "Generic Business",
      confidence: 0.35,
      signals: [],
    };
  }

  return {
    domain: best.domain,
    confidence: Number(Math.min(0.95, 0.45 + best.score * 0.08).toFixed(2)),
    signals: best.matchedKeywords.slice(0, 8),
  };
}

function inferDatasetType(domain, features) {
  const columnText = features.columns.map(normalizeText).join(" ");

  if (features.dateColumns.length && features.currencyColumns.length) return `${domain} Time Series`;
  if (domain === "Movies") return "Media Catalog";
  if (domain === "HR" && columnText.includes("attendance")) return "Attendance Dataset";
  if (domain === "Inventory" && features.identifierColumns.length) return "Inventory Master";
  if (domain === "Education" && /score|marks|grade/.test(columnText)) return "Student Performance Dataset";
  if (features.currencyColumns.length) return `${domain} Transaction Dataset`;
  if (features.identifierColumns.length && features.categoricalColumns.length) return `${domain} Master Dataset`;
  return `${domain} Analytical Dataset`;
}

function calculateDataQualityScore({ rowCount, columnCount, missingValues, duplicateRows, emptyColumnCount }) {
  if (rowCount === 0 || columnCount === 0) return 0;

  const totalCells = rowCount * columnCount;
  const missingPenalty = (missingValues.totalMissing / totalCells) * 55;
  const duplicatePenalty = (duplicateRows / rowCount) * 25;
  const emptyColumnPenalty = (emptyColumnCount / columnCount) * 20;

  return Math.max(0, Math.round(100 - missingPenalty - duplicatePenalty - emptyColumnPenalty));
}

function buildSuggestions(features) {
  return {
    bestChartTypes: suggestChartTypes(features),
    kpiCards: suggestKpiCards(features),
    businessMetrics: suggestBusinessMetrics(features),
  };
}

function suggestChartTypes({ numericalColumns, categoricalColumns, dateColumns, currencyColumns }) {
  const charts = [];

  if (dateColumns.length && numericalColumns.length) {
    charts.push(chart("line", "Trend over time", dateColumns[0], numericalColumns[0]));
    charts.push(chart("area", "Cumulative or volume trend", dateColumns[0], numericalColumns[0]));
  }
  if (categoricalColumns.length && (currencyColumns.length || numericalColumns.length)) {
    charts.push(chart("bar", "Compare values across categories", categoricalColumns[0], currencyColumns[0] || numericalColumns[0]));
    charts.push(chart("pie", "Show category contribution", categoricalColumns[0], currencyColumns[0] || numericalColumns[0]));
  }
  if (numericalColumns.length >= 2) {
    charts.push(chart("scatter", "Reveal relationship between two measures", numericalColumns[0], numericalColumns[1]));
  }
  if (numericalColumns.length) {
    charts.push(chart("histogram", "Understand numeric distribution", numericalColumns[0], "count"));
  }

  return dedupeByType(charts).slice(0, 6);
}

function suggestKpiCards({ domain, numericalColumns, currencyColumns, dateColumns, identifierColumns }) {
  const cards = [
    { label: "Total Rows", metric: "row_count", aggregation: "count" },
  ];

  for (const column of currencyColumns.slice(0, 3)) {
    cards.push({ label: `Total ${toTitle(column)}`, metric: column, aggregation: "sum" });
    cards.push({ label: `Average ${toTitle(column)}`, metric: column, aggregation: "average" });
  }

  for (const column of numericalColumns.filter((col) => !currencyColumns.includes(col)).slice(0, 2)) {
    cards.push({ label: `Average ${toTitle(column)}`, metric: column, aggregation: "average" });
  }

  if (identifierColumns.length) cards.push({ label: `Unique ${toTitle(identifierColumns[0])}`, metric: identifierColumns[0], aggregation: "distinct_count" });
  if (dateColumns.length) cards.push({ label: "Date Range", metric: dateColumns[0], aggregation: "min_max" });
  if (domain === "Movies") cards.push({ label: "Titles", metric: "title_count", aggregation: "count" });

  return cards.slice(0, 8);
}

function suggestBusinessMetrics({ domain, numericalColumns, categoricalColumns, dateColumns, currencyColumns, identifierColumns }) {
  const metrics = [];
  const money = currencyColumns[0];
  const category = categoricalColumns[0];
  const date = dateColumns[0];

  if (money) metrics.push({ name: "Total Value", formula: `sum(${money})` });
  if (money && category) metrics.push({ name: `Value by ${toTitle(category)}`, formula: `sum(${money}) grouped by ${category}` });
  if (money && date) metrics.push({ name: "Period-over-Period Growth", formula: `sum(${money}) by ${date}` });
  if (identifierColumns[0]) metrics.push({ name: `Unique ${toTitle(identifierColumns[0])}`, formula: `distinct_count(${identifierColumns[0]})` });
  if (numericalColumns[0]) metrics.push({ name: `Average ${toTitle(numericalColumns[0])}`, formula: `avg(${numericalColumns[0]})` });

  if (domain === "Sales") metrics.push({ name: "Average Order Value", formula: "total_revenue / order_count" });
  if (domain === "Retail" || domain === "Inventory") metrics.push({ name: "Stock Movement", formula: "quantity by product/category over time" });
  if (domain === "HR") metrics.push({ name: "Department Headcount", formula: "employee count by department" });
  if (domain === "Movies") metrics.push({ name: "Release Trend", formula: "title count by release year" });
  if (domain === "Education") metrics.push({ name: "Average Score by Class", formula: "avg(score/marks) by class/subject" });

  return dedupeByName(metrics).slice(0, 8);
}

function chart(type, reason, xAxis, yAxis) {
  return { type, reason, xAxis, yAxis };
}

function dedupeByType(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.type)) return false;
    seen.add(item.type);
    return true;
  });
}

function dedupeByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function isMissing(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function normalizeValue(value) {
  return isMissing(value) ? null : String(value).trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[_-]+/g, " ");
}

function toTitle(value) {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = {
  analyzeDatasetIntelligence,
  analyzeDatasetFile,
};
