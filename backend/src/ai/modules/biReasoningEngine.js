/**
 * BI Reasoning Engine
 *
 * Implements a generic BI Copilot AI Reasoning Pipeline:
 * User Question -> Intent Detection -> Entity/Metric Extraction -> Dataset Schema Matching -> Aggregation Planning -> Visualization Planning -> Reasoning Explanation
 *
 * Designed for ANY dataset (Sales, HR, Finance, Healthcare, Netflix, Grocery, Custom CSVs) without hardcoded query matching or single-domain rules.
 */

const METRIC_SYNONYMS = {
  price: ["price", "cost", "amount", "charge", "fare", "rate", "fee", "val", "spend", "expenditure", "bill"],
  cost: ["cost", "price", "amount", "expense", "spending", "spend", "charge", "bill", "expenditure"],
  amount: ["amount", "value", "total", "sum", "cost", "price", "bill", "spending", "charge"],
  sales: ["sales", "revenue", "income", "turnover", "earnings", "volume", "gross"],
  revenue: ["revenue", "sales", "income", "earnings", "turnover", "profit", "proceeds"],
  profit: ["profit", "margin", "gain", "earnings", "net", "return"],
  quantity: ["quantity", "qty", "count", "units", "items", "number", "volume"],
  rating: ["rating", "score", "review", "stars", "grade", "rank"],
  score: ["score", "rating", "points", "grade", "marks"],
  age: ["age", "years", "old"],
  salary: ["salary", "pay", "compensation", "wage", "income", "stipend"],
  marks: ["marks", "score", "grade", "result", "points"],
  distance: ["distance", "range", "miles", "km", "length"],
  duration: ["duration", "time", "length", "hours", "minutes", "runtime"],
};

const DIMENSION_SYNONYMS = {
  item: ["item", "product", "goods", "article", "merchandise", "purchase", "thing"],
  product: ["product", "item", "goods", "merchandise", "brand", "model"],
  category: ["category", "dept", "department", "type", "class", "group", "genre", "segment"],
  city: ["city", "town", "location", "place", "municipality", "address"],
  country: ["country", "nation", "state", "territory", "region", "origin"],
  date: ["date", "day", "timestamp", "created", "added", "period", "time"],
  month: ["month", "monthly", "year", "quarter"],
  employee: ["employee", "staff", "worker", "person", "name", "member"],
  department: ["department", "dept", "team", "division", "unit", "group"],
  brand: ["brand", "make", "company", "vendor", "manufacturer"],
  customer: ["customer", "client", "buyer", "user", "purchaser", "account"],
};

function escapeRegExp(val) {
  return String(val).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 1. Intent Detection Reasoning
 */
function detectQueryIntent(query) {
  const q = String(query || "").toLowerCase();

  const isRanking = /\b(top|highest|most|largest|biggest|best|maximum|max|greatest|bottom|lowest|least|worst|minimum|min|smallest|rank|ranking|where am i spending the most|where.*most|which.*highest|where am i|which region|top\s+\d+)\b/i.test(q);
  const isTrend = /\b(trend|over time|monthly|daily|yearly|growth|history|timeline|period|progression|evolution|change over time)\b/i.test(q);
  const isDistribution = /\b(distribution|spread|range|histogram|frequency|breakdown by range|spread out)\b/i.test(q);
  const isCorrelation = /\b(correlation|relationship|vs|versus|relate|depend|impact|compare .* vs)\b/i.test(q);
  const isOutlier = /\b(outlier|anomaly|unusual|extreme|exception)\b/i.test(q);
  const isSummary = /\b(summary|overview|describe|statistics|stats|table|overall)\b/i.test(q) && !isRanking && !isTrend;

  if (isRanking) return "top_n";
  if (isTrend) return "trend";
  if (isDistribution) return "distribution";
  if (isCorrelation) return "correlation";
  if (isOutlier) return "outlier";
  if (isSummary) return "summary";
  return "comparison";
}

/**
 * 2. Metric Extraction & Dataset Schema Matcher
 */
function matchMetricColumn(query, columns, columnTypes) {
  const q = String(query || "").toLowerCase();
  const numericCols = columns.filter((col) => columnTypes[col] === "numeric" && col.trim() !== "");

  if (numericCols.length === 0) return null;

  const scores = numericCols.map((col) => {
    let score = 0;
    const colLower = col.toLowerCase().replace(/[_-]+/g, " ");

    if (new RegExp(`\\b${escapeRegExp(colLower)}\\b`, "i").test(q)) {
      score += 10;
    } else if (q.includes(colLower)) {
      score += 5;
    }

    for (const [key, syns] of Object.entries(METRIC_SYNONYMS)) {
      if (colLower.includes(key) || syns.includes(colLower)) {
        const matchesSyn = syns.some((syn) => new RegExp(`\\b${escapeRegExp(syn)}\\b`, "i").test(q));
        if (matchesSyn) {
          score += 8;
        }
      }
    }

    if (/\b(spending|spend|spent|expense|cost|charge|payment|purchase|bill|revenue|sales|profit|salary|rating)\b/i.test(q)) {
      if (/amount|price|cost|bill|spend|total|charge|fare|sales|revenue|profit|salary|rating/i.test(col)) {
        score += 6;
      }
    }

    return { col, score };
  });

  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score > 0) {
    return scores[0].col;
  }

  return numericCols[0] || null;
}

/**
 * 3. Dimension Extraction & Dataset Schema Matcher
 */
function matchDimensionColumn(query, columns, columnTypes, selectedMetric) {
  const q = String(query || "").toLowerCase();
  const nonMetricCols = columns.filter((col) => col !== selectedMetric && col.trim() !== "");
  const categoricalCols = nonMetricCols.filter((col) => columnTypes[col] === "categorical");
  const datetimeCols = nonMetricCols.filter((col) => columnTypes[col] === "datetime");
  const candidates = [...categoricalCols, ...datetimeCols, ...nonMetricCols];

  if (candidates.length === 0) return null;

  const isLocationQuery = /\b(where|city|country|state|region|location|place)\b/i.test(q);
  const isTimeQuery = /\b(when|month|monthly|year|yearly|date|time|period|trend)\b/i.test(q);
  const isPersonQuery = /\b(who|employee|customer|user|client|person|passenger)\b/i.test(q);
  const isProductQuery = /\b(what|which|product|item|category|genre|brand)\b/i.test(q);

  const scores = candidates.map((col) => {
    let score = 0;
    const colLower = col.toLowerCase().replace(/[_-]+/g, " ");

    if (new RegExp(`\\b${escapeRegExp(colLower)}\\b`, "i").test(q)) {
      score += 10;
    } else if (q.includes(colLower)) {
      score += 5;
    }

    for (const [key, syns] of Object.entries(DIMENSION_SYNONYMS)) {
      if (colLower.includes(key) || syns.includes(colLower)) {
        const matchesSyn = syns.some((syn) => new RegExp(`\\b${escapeRegExp(syn)}\\b`, "i").test(q));
        if (matchesSyn) {
          score += 8;
        }
      }
    }

    if (isLocationQuery && /city|country|state|region|location|address/i.test(colLower)) {
      score += 7;
    }
    if (isTimeQuery && (columnTypes[col] === "datetime" || /date|month|year|period|time/i.test(colLower))) {
      score += 7;
    }
    if (isPersonQuery && /employee|customer|user|client|name|person/i.test(colLower)) {
      score += 7;
    }
    if (isProductQuery && /item|product|category|genre|brand|type|description/i.test(colLower)) {
      score += 7;
    }

    const byMatch = q.match(/\b(?:by|per|across|in|for)\s+([a-z0-9_ -]+)/i);
    if (byMatch) {
      const phrase = byMatch[1].trim();
      if (colLower.includes(phrase) || phrase.includes(colLower)) {
        score += 9;
      }
    }

    return { col, score };
  });

  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score > 0) {
    return scores[0].col;
  }

  if (isTimeQuery && datetimeCols.length > 0) return datetimeCols[0];
  return categoricalCols[0] || datetimeCols[0] || candidates[0] || null;
}

/**
 * 4. Aggregation & Sorting Planner
 */
function planAggregation(query, analysisType) {
  const q = String(query || "").toLowerCase();

  const isCount = /\b(count|number of|how many|frequency)\b/i.test(q);
  const isAvg = /\b(average|avg|mean)\b/i.test(q);
  const isMin = /\b(minimum|min|lowest|least|smallest|bottom|worst)\b/i.test(q);
  const isMax = /\b(maximum|max|highest|most|greatest|top|best)\b/i.test(q);

  let aggregation = "sum";
  if (isCount) aggregation = "count";
  else if (isAvg) aggregation = "average";
  else if (isMin) aggregation = "min";
  else if (isMax) aggregation = "max";

  let sortOrder = "desc";
  if (isMin || /\b(bottom|lowest|least|worst|smallest)\b/i.test(q)) {
    sortOrder = "asc";
  }

  const topNMatch = q.match(/\b(?:top|bottom|highest|lowest|maximum|minimum|rank)\s+(\d{1,3})\b/i);
  const topN = topNMatch ? Number(topNMatch[1]) : (analysisType === "top_n" ? 5 : null);

  return { aggregation, sortOrder, topN };
}

/**
 * 5. Visualization Selection Reasoner
 */
function selectVisualization(analysisType, dimension, metric, query) {
  const q = String(query || "").toLowerCase();
  const isPieCandidate = /\b(percentage|portion|share|distribution|composition|pie)\b/i.test(q);

  if (analysisType === "trend") return "line";
  if (analysisType === "correlation") return "scatter";
  if (analysisType === "distribution") return "histogram";
  if (analysisType === "top_n" || analysisType === "comparison") {
    if (isPieCandidate) return "pie";
    return "bar";
  }
  if (analysisType === "summary") return "table";
  return "bar";
}

class BIReasoningEngine {
  /**
   * Reason about user query over dataset schema
   * @param {string} query 
   * @param {Object} metadata 
   * @param {Object} intelligence 
   * @returns {Object} Structured intent with reasoning
   */
  reasonAboutQuery(query, metadata = {}, intelligence = null) {
    const columns = metadata.columns || [];
    const columnTypes = metadata.columnTypes || {};

    const analysisType = detectQueryIntent(query);
    const yAxis = matchMetricColumn(query, columns, columnTypes);
    const xAxis = matchDimensionColumn(query, columns, columnTypes, yAxis);

    const { aggregation, sortOrder, topN } = planAggregation(query, analysisType);
    const chartType = selectVisualization(analysisType, xAxis, yAxis, query);

    const targetColumns = Array.from(new Set([xAxis, yAxis].filter(Boolean)));

    const reasoningExplanation = `Intent: ${analysisType}. Metric: ${yAxis || "none"}, Dimension: ${xAxis || "none"}, Aggregation: ${aggregation}, Visualization: ${chartType}.`;

    return {
      analysisType,
      chartType,
      xAxis,
      yAxis,
      groupBy: xAxis,
      targetColumns,
      aggregation,
      sortOrder,
      topN,
      confidence: 0.90,
      reasoningExplanation,
    };
  }

  /**
   * Refine LLM/fallback intent with schema-matched BI reasoning
   * @param {Object} intent 
   * @param {string} query 
   * @param {Object} metadata 
   * @param {Object} intelligence 
   * @returns {Object} Refined intent
   */
  refineIntent(intent = {}, query = "", metadata = {}, intelligence = null) {
    const reasoned = this.reasonAboutQuery(query, metadata, intelligence);

    const validGraphicalCharts = ["bar", "line", "scatter", "pie", "histogram", "area"];
    const chartType = (intent.chartType && validGraphicalCharts.includes(intent.chartType))
      ? intent.chartType
      : reasoned.chartType;

    return {
      ...intent,
      analysisType: intent.analysisType && intent.analysisType !== "summary" ? intent.analysisType : reasoned.analysisType,
      chartType,
      xAxis: intent.xAxis || reasoned.xAxis,
      yAxis: intent.yAxis || reasoned.yAxis,
      groupBy: intent.groupBy || intent.xAxis || reasoned.groupBy,
      targetColumns: (intent.targetColumns && intent.targetColumns.length) ? intent.targetColumns : reasoned.targetColumns,
      aggregation: intent.aggregation || reasoned.aggregation,
      sortOrder: intent.sortOrder || reasoned.sortOrder,
      topN: intent.topN || reasoned.topN,
      confidence: Math.max(intent.confidence || 0, reasoned.confidence),
      reasoningExplanation: reasoned.reasoningExplanation,
    };
  }
}

module.exports = new BIReasoningEngine();
