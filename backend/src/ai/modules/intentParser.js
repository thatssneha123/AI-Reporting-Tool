const fs = require("fs");
const path = require("path");
const { callLLMJson } = require("../services/llmService");
const { classifyQuery } = require("./queryClassifier");
const biReasoningEngine = require("./biReasoningEngine");

const combinedPrompt = fs.readFileSync(
  path.join(__dirname, "../prompts/combinedPrompt.txt"),
  "utf-8"
);

/**
 * Parse user query into structured intent
 * Optionally uses dataset intelligence for context-aware parsing
 * @param {string} query - User query
 * @param {Object} metadata - Dataset metadata (columns, types, rowCount)
 * @param {Object} options - Optional: { intelligence, classificationContext }
 * @returns {Object} Parsed intent
 */
async function parseIntent(query, metadata, options = {}) {
  const intelligence = options.intelligence || null;
  const classificationContext = options.classificationContext || classifyQuery(query);

  // Build enhanced prompt with intelligence context
  let promptContext = `
${combinedPrompt}

User Query:
${query}

Dataset Info:
Columns: ${metadata.columns.join(", ")}
Types: ${JSON.stringify(metadata.columnTypes)}
RowCount: ${metadata.rowCount}`;

  // Add intelligence context if available
  if (intelligence && intelligence.dataset) {
    promptContext += `

Dataset Domain: ${intelligence.dataset.domain}
Dataset Type: ${intelligence.dataset.inferredType}
Domain Signals: ${(intelligence.dataset.domainSignals || []).join(", ")}`;
  }

  // Add query classification hint
  if (classificationContext && classificationContext.category) {
    promptContext += `

Query Category: ${classificationContext.category}
Query Type: ${classificationContext.mode}`;
  }

  let rawIntent;
  try {
    rawIntent = await callLLMJson(promptContext, "");
  } catch (error) {
    if (process.env.AI_DEBUG === "true") {
      console.warn("LLM intent parsing failed, using BI Reasoning Engine:", error.message);
    }
    rawIntent = biReasoningEngine.reasonAboutQuery(query, metadata, intelligence);
  }

  const hinted = applyQueryHints(rawIntent, query, metadata, intelligence);
  return biReasoningEngine.refineIntent(hinted, query, metadata, intelligence);
}

function applyQueryHints(intent, query, metadata, intelligence = null) {
  const q = String(query || "").toLowerCase();
  const columns = metadata.columns || [];
  const columnTypes = metadata.columnTypes || {};
  const numericColumns = columns.filter((col) => columnTypes[col] === "numeric" && col.trim() !== "");
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "categorical");
  const datetimeColumns = columns.filter((col) => columnTypes[col] === "datetime");
  const findColumn = (patterns, candidates = columns) =>
    candidates.find((col) => patterns.some((pattern) => col.toLowerCase().includes(pattern)));

  // Build synonym map for semantic column matching
  const synonymMap = buildColumnSynonyms(columns);

  // Enhanced findMentionedColumn: checks exact column names AND synonyms
  const findMentionedColumn = (candidates = columns) => {
    // 1. Try exact column name match (original behavior)
    const exactMatch = candidates.find((col) => {
      const normalized = normalizeColumnName(col);
      return normalized && new RegExp(`\\b${escapeRegExp(normalized)}\\b`, "i").test(q);
    });
    if (exactMatch) return exactMatch;

    // 2. Try synonym-based semantic match
    for (const col of candidates) {
      const synonyms = synonymMap[col] || [];
      for (const syn of synonyms) {
        if (syn && new RegExp(`\\b${escapeRegExp(syn)}\\b`, "i").test(q)) {
          return col;
        }
      }
    }
    return null;
  };

  const hasTerm = (term) => new RegExp(`\\b${term}\\b`, "i").test(q);
  
  // Enhanced with intelligence context
  let hintedGroup = null;
  if (hasTerm("month") || hasTerm("monthly")) {
    hintedGroup = findColumn(["month"]);
  } else if (hasTerm("city")) {
    hintedGroup = findColumn(["city"]);
  } else if (hasTerm("company")) {
    hintedGroup = findColumn(["company"]);
  } else {
    hintedGroup = findByPhraseColumn(q, categoricalColumns) ||
      findMentionedColumn(categoricalColumns) ||
      findByPhraseColumn(q, datetimeColumns) ||
      null;
  }

  // Use intelligence-suggested categorical column as fallback
  if (!hintedGroup && intelligence?.schema?.categoricalColumns?.[0]) {
    hintedGroup = intelligence.schema.categoricalColumns[0];
  }

  const hintedValue =
    ((hasTerm("bill") || hasTerm("amount") || hasTerm("cost") || hasTerm("charge")) &&
      findColumn(["bill", "amount", "cost", "charge", "total"], numericColumns)) ||
    ((hasTerm("consumption") || hasTerm("usage") || hasTerm("hour") || hasTerm("unit")) &&
      findColumn(["consumption", "usage", "unit", "hour"], numericColumns)) ||
    findMentionedColumn(numericColumns) ||
    null;

  // Detect count-based queries: "number of", "how many", "count", "passengers in each"
  const isCountQuery = /\b(number of|how many|count|total number|passengers in|in each|per each)\b/i.test(q);

  // Use intelligence-suggested numeric column as fallback
  let finalValueColumn = hintedValue;
  if (!finalValueColumn && !isCountQuery && intelligence?.schema?.numericalColumns?.[0]) {
    finalValueColumn = intelligence.schema.numericalColumns[0];
  }

  const topNMatch = q.match(/\b(?:top|bottom|highest|lowest|maximum|minimum|rank)\s+(\d{1,3})\b/);
  const hintedTopN = topNMatch ? Number(topNMatch[1]) : null;

  const next = normalizeIntent({ ...intent }, metadata);
  if (hintedGroup) {
    next.groupBy = hintedGroup;
    next.xAxis = hintedGroup;
    if (hasTerm("month") || hasTerm("monthly")) {
      next.analysisType = "trend";
      next.chartType = "line";
    } else if (isCountQuery) {
      // Count-based query: use distribution to get value counts
      next.analysisType = "distribution";
      next.chartType = "bar";
      next.aggregation = "count";
    } else if (finalValueColumn) {
      next.analysisType = "comparison";
      next.chartType = "bar";
    } else if (next.analysisType === "summary") {
      next.analysisType = "comparison";
    }
  }
  if (finalValueColumn) {
    next.yAxis = finalValueColumn;
  }
  if (hintedTopN) {
    next.topN = hintedTopN;
    next.analysisType = "top_n";
  }
  const targets = new Set([...(Array.isArray(next.targetColumns) ? next.targetColumns : [])]);
  if (next.groupBy) targets.add(next.groupBy);
  if (next.yAxis) targets.add(next.yAxis);
  next.targetColumns = Array.from(targets);
  return normalizeIntent(next, metadata);
}

function normalizeIntent(intent, metadata) {
  const columns = metadata.columns || [];
  const columnTypes = metadata.columnTypes || {};
  const numericColumns = columns.filter((col) => columnTypes[col] === "numeric");
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "categorical");
  const datetimeColumns = columns.filter((col) => columnTypes[col] === "datetime");
  const validAnalysisTypes = new Set(["summary", "distribution", "comparison", "aggregation", "trend", "correlation", "top_n", "outlier"]);
  const validChartTypes = new Set(["bar", "line", "scatter", "pie", "histogram", "area", "table"]);
  const next = { ...intent };

  next.groupBy = resolveColumn(next.groupBy, columns);
  next.xAxis = resolveColumn(next.xAxis, columns) || next.groupBy || null;
  next.yAxis = resolveColumn(next.yAxis, columns) || null;
  next.targetColumns = Array.isArray(next.targetColumns)
    ? next.targetColumns.map((col) => resolveColumn(col, columns)).filter(Boolean)
    : [];

  if (!validAnalysisTypes.has(next.analysisType)) {
    if (next.groupBy && (next.yAxis || numericColumns.length)) next.analysisType = "comparison";
    else if (datetimeColumns.length && (next.yAxis || numericColumns.length)) next.analysisType = "trend";
    else if (numericColumns.length >= 2) next.analysisType = "correlation";
    else if (categoricalColumns.length || numericColumns.length) next.analysisType = "comparison";
    else next.analysisType = "summary";
  }

  if (!validChartTypes.has(next.chartType)) {
    next.chartType = next.analysisType === "trend"
      ? "line"
      : next.analysisType === "correlation"
        ? "scatter"
        : next.analysisType === "distribution"
          ? "bar"
          : "bar";
  }

  return next;
}

/**
 * Build semantic synonyms for each column name
 * Maps natural language terms to actual dataset column names
 */
function buildColumnSynonyms(columns) {
  // Known synonym patterns: maps column-name fragments to common natural language terms
  const knownSynonyms = {
    // Titanic
    "pclass": ["passenger class", "class", "ticket class", "cabin class"],
    "sex": ["gender", "male", "female"],
    "survived": ["survival", "alive", "dead", "death", "living"],
    "sibsp": ["siblings", "spouse", "sibling spouse"],
    "parch": ["parents", "children", "parent child"],
    "fare": ["ticket price", "price", "ticket fare", "cost"],
    "embarked": ["port", "embarkation", "boarding port", "departure"],
    "age": ["years old", "passenger age"],
    // Netflix/Movies
    "type": ["content type", "show type", "format"],
    "listed_in": ["genre", "genres", "category", "categories"],
    "release_year": ["year", "released", "release date"],
    "rating": ["content rating", "age rating", "maturity"],
    "director": ["directed by", "filmmaker", "creator"],
    "duration": ["length", "runtime", "time"],
    "country": ["nation", "origin", "region"],
    "date_added": ["added date", "upload date"],
    // Retail/Sales
    "category": ["product category", "department", "type"],
    "sales": ["revenue", "income", "total sales"],
    "profit": ["margin", "earnings", "net"],
    "quantity": ["qty", "count", "units", "items"],
    "region": ["area", "territory", "zone", "location"],
    "customer": ["client", "buyer", "account"],
    // General
    "amount": ["value", "total", "sum"],
    "date": ["day", "time", "when", "period"],
    "name": ["title", "label"],
    "department": ["dept", "team", "group", "division"],
    "salary": ["pay", "compensation", "wage", "income"],
  };

  const map = {};
  for (const col of columns) {
    const colLower = col.toLowerCase().replace(/[_-]+/g, "");
    const synonyms = [];

    // Check known synonyms
    for (const [fragment, syns] of Object.entries(knownSynonyms)) {
      if (colLower === fragment || colLower.includes(fragment)) {
        synonyms.push(...syns);
      }
    }

    // Also add the column name with underscores/hyphens replaced by spaces
    const spaced = col.replace(/[_-]+/g, " ").trim().toLowerCase();
    if (spaced !== col.toLowerCase()) {
      synonyms.push(spaced);
    }

    map[col] = synonyms;
  }
  return map;
}

function resolveColumn(value, columns) {
  if (!value) return null;
  const raw = String(value);
  const inner = raw.match(/\(([^)]+)\)/)?.[1] || raw;

  // 1. Exact match
  const exact = columns.find((column) => column === inner)
    || columns.find((column) => column.toLowerCase() === inner.toLowerCase())
    || columns.find((column) => normalizeColumnName(column) === normalizeColumnName(inner));
  if (exact) return exact;

  // 2. Synonym-based resolution
  const synonymMap = buildColumnSynonyms(columns);
  const innerLower = inner.toLowerCase().replace(/[_-]+/g, " ").trim();
  for (const col of columns) {
    const synonyms = synonymMap[col] || [];
    if (synonyms.some(s => s.toLowerCase() === innerLower)) {
      return col;
    }
  }

  return null;
}

function findByPhraseColumn(query, columns) {
  const match = query.match(/\bby\s+([a-z0-9_ -]+)/i);
  if (!match) return null;
  const phrase = match[1].split(/\b(?:for|where|with|and|over|show|top|bottom)\b/i)[0].trim();
  return resolveColumn(phrase, columns);
}

function normalizeColumnName(value) {
  return String(value || "").replace(/^\uFEFF/, "").replace(/[_-]+/g, " ").trim().toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFallbackIntent(query, metadata, intelligence = null) {
  const q = String(query || "").toLowerCase();
  const columns = metadata.columns || [];
  const columnTypes = metadata.columnTypes || {};
  const numericColumns = columns.filter((col) => columnTypes[col] === "numeric" && col.trim() !== "");
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "categorical");
  const datetimeColumns = columns.filter((col) => columnTypes[col] === "datetime");

  const findColumn = (patterns, candidates = columns) =>
    candidates.find((col) => patterns.some((pattern) => col.toLowerCase().includes(pattern)));

  // Enhanced: use intelligence schema if available
  const intelligenceNumeric = intelligence?.schema?.numericalColumns || [];
  const intelligenceCategorical = intelligence?.schema?.categoricalColumns || [];
  const intelligenceDatetime = intelligence?.schema?.dateColumns || [];

  const periodColumn =
    findColumn(["date", "month", "year", "period"], columns) ||
    intelligenceDatetime[0] ||
    datetimeColumns[0];

  const groupColumn =
    (q.includes("city") && findColumn(["city"], categoricalColumns)) ||
    (q.includes("company") && findColumn(["company"], categoricalColumns)) ||
    periodColumn ||
    intelligenceCategorical[0] ||
    categoricalColumns[0] ||
    null;

  const valueColumn =
    ((q.includes("consumption") || q.includes("usage") || q.includes("hour") || q.includes("unit")) &&
      findColumn(["consumption", "usage", "unit", "hour"], numericColumns)) ||
    ((q.includes("bill") || q.includes("amount") || q.includes("cost") || q.includes("charge")) &&
      findColumn(["bill", "amount", "cost", "charge", "price", "total"], numericColumns)) ||
    findColumn(["bill", "amount", "cost", "charge", "total", "sales", "revenue"], numericColumns) ||
    intelligenceNumeric[0] ||
    numericColumns.find((col) => col !== groupColumn) ||
    numericColumns[0] ||
    null;

  const isTop = /\b(top|highest|lowest|maximum|minimum|rank)\b/.test(q);
  const topNMatch = q.match(/\b(?:top|bottom|highest|lowest|maximum|minimum|rank)\s+(\d{1,3})\b/);
  const isTrend = /\b(trend|month|monthly|date|time|over time)\b/.test(q);
  const isDistribution = /\b(distribution|spread|histogram)\b/.test(q);
  const isCorrelation = /\b(correlation|relation|relationship|compare .* vs)\b/.test(q);

  let analysisType = "comparison";
  if (isTop) analysisType = "top_n";
  else if (isTrend && periodColumn) analysisType = "trend";
  else if (isDistribution) analysisType = "distribution";
  else if (isCorrelation) analysisType = "correlation";
  else if (!groupColumn) analysisType = "summary";

  return {
    analysisType,
    targetColumns: [groupColumn, valueColumn].filter(Boolean),
    groupBy: groupColumn,
    aggregation: "sum",
    chartType: analysisType === "trend" ? "line" : analysisType === "correlation" ? "scatter" : "bar",
    xAxis: groupColumn,
    yAxis: valueColumn,
    topN: topNMatch ? Number(topNMatch[1]) : isTop ? 10 : null,
    sortOrder: q.includes("lowest") || q.includes("minimum") ? "asc" : "desc",
    confidence: 0.55,
    fallbackReason: "LLM unavailable",
  };
}

module.exports = { parseIntent };
