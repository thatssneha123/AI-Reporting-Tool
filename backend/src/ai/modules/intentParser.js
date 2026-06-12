const fs = require("fs");
const path = require("path");
const { callLLMJson } = require("../services/llmService");

const combinedPrompt = fs.readFileSync(
  path.join(__dirname, "../prompts/combinedPrompt.txt"),
  "utf-8"
);

async function parseIntent(query, metadata) {
  const fullPrompt = `
${combinedPrompt}

User Query:
${query}

Dataset Info:
Columns: ${metadata.columns.join(", ")}
Types: ${JSON.stringify(metadata.columnTypes)}
RowCount: ${metadata.rowCount}
`;

  try {
    const intent = await callLLMJson(fullPrompt, "");
    return applyQueryHints(intent, query, metadata);
  } catch (error) {
    if (process.env.AI_DEBUG === "true") {
      console.warn("LLM intent parsing failed, using local fallback:", error.message);
    }

    return applyQueryHints(buildFallbackIntent(query, metadata), query, metadata);
  }
}

function applyQueryHints(intent, query, metadata) {
  const q = String(query || "").toLowerCase();
  const columns = metadata.columns || [];
  const columnTypes = metadata.columnTypes || {};
  const numericColumns = columns.filter((col) => columnTypes[col] === "numeric" && col.trim() !== "");
  const findColumn = (patterns, candidates = columns) =>
    candidates.find((col) => patterns.some((pattern) => col.toLowerCase().includes(pattern)));

  const hasTerm = (term) => new RegExp(`\\b${term}\\b`, "i").test(q);
  const hintedGroup =
    ((hasTerm("month") || hasTerm("monthly")) && findColumn(["month"])) ||
    (hasTerm("city") && findColumn(["city"])) ||
    (hasTerm("company") && findColumn(["company"])) ||
    null;

  const hintedValue =
    ((hasTerm("bill") || hasTerm("amount") || hasTerm("cost") || hasTerm("charge")) &&
      findColumn(["bill", "amount", "cost", "charge", "total"], numericColumns)) ||
    ((hasTerm("consumption") || hasTerm("usage") || hasTerm("hour") || hasTerm("unit")) &&
      findColumn(["consumption", "usage", "unit", "hour"], numericColumns)) ||
    null;
  const topNMatch = q.match(/\b(?:top|bottom|highest|lowest|maximum|minimum|rank)\s+(\d{1,3})\b/);
  const hintedTopN = topNMatch ? Number(topNMatch[1]) : null;

  const next = { ...intent };
  if (hintedGroup) {
    next.groupBy = hintedGroup;
    next.xAxis = hintedGroup;
    if (hasTerm("month") || hasTerm("monthly")) {
      next.analysisType = "trend";
      next.chartType = "line";
    } else if (hintedValue) {
      next.analysisType = "comparison";
      next.chartType = "bar";
    } else if (next.analysisType === "summary") {
      next.analysisType = "comparison";
    }
  }
  if (hintedValue) {
    next.yAxis = hintedValue;
  }
  if (hintedTopN) {
    next.topN = hintedTopN;
    next.analysisType = "top_n";
  }
  const targets = new Set([...(Array.isArray(next.targetColumns) ? next.targetColumns : [])]);
  if (next.groupBy) targets.add(next.groupBy);
  if (next.yAxis) targets.add(next.yAxis);
  next.targetColumns = Array.from(targets);
  return next;
}

function buildFallbackIntent(query, metadata) {
  const q = String(query || "").toLowerCase();
  const columns = metadata.columns || [];
  const columnTypes = metadata.columnTypes || {};
  const numericColumns = columns.filter((col) => columnTypes[col] === "numeric" && col.trim() !== "");
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "categorical");
  const datetimeColumns = columns.filter((col) => columnTypes[col] === "datetime");

  const findColumn = (patterns, candidates = columns) =>
    candidates.find((col) => patterns.some((pattern) => col.toLowerCase().includes(pattern)));

  const periodColumn =
    findColumn(["date", "month", "year", "period"], columns) ||
    datetimeColumns[0];

  const groupColumn =
    (q.includes("city") && findColumn(["city"], categoricalColumns)) ||
    (q.includes("company") && findColumn(["company"], categoricalColumns)) ||
    periodColumn ||
    categoricalColumns[0] ||
    null;

  const valueColumn =
    ((q.includes("consumption") || q.includes("usage") || q.includes("hour") || q.includes("unit")) &&
      findColumn(["consumption", "usage", "unit", "hour"], numericColumns)) ||
    ((q.includes("bill") || q.includes("amount") || q.includes("cost") || q.includes("charge")) &&
      findColumn(["bill", "amount", "cost", "charge", "price", "total"], numericColumns)) ||
    findColumn(["bill", "amount", "cost", "charge", "total", "sales", "revenue"], numericColumns) ||
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
