const { analyzeDataset, summarizeAnalysis } = require("../modules/datasetAnalyzer");
const { parseIntent } = require("../modules/intentParser");
const { planVisualization } = require("../modules/visualizationPlanner");
const { generateInsights } = require("../modules/insightGenerator");

const {
  groupByAggregate,
  getValueCounts,
  timeSeries,
  aggregateNumeric
} = require("../utils/aggregation");

// 🔥 MAIN AGENT
async function runAgent(userInput, rawDataset, options = {}) {
  const startTime = Date.now();
  const datasetIntelligence = options.datasetIntelligence || null;
  const queryClassification = options.queryClassification || null;

  // 1️⃣ Analyze dataset
  const analysis = analyzeDataset(rawDataset);
  if (analysis.error) return { error: analysis.error };

  const summary = summarizeAnalysis(analysis);

  // 2️⃣ Understand intent (LLM) - now with intelligence context
  const intent = await parseIntent(userInput, {
    columns: analysis.columns,
    columnTypes: analysis.columnTypes,
    rowCount: analysis.rowCount
  }, {
    intelligence: datasetIntelligence,
    classificationContext: queryClassification,
  });
  
intent.rawUserInput = userInput;

if (process.env.AI_DEBUG === "true") {
  console.log("RAW INPUT:", intent.rawUserInput);
  console.log("QUERY CLASSIFICATION:", queryClassification);
}

  // 3️⃣ Compute data (pure JS)
  const computedData = computeData(intent, analysis);

  // 4️⃣ Plan visualization (LLM)
  const vizPlan = {
  chartType: intent.chartType,
  xAxis: intent.xAxis,
  yAxis: intent.yAxis
 };
  // 5️⃣ Generate insights (LLM)
  const insights = await generateInsights(
    analysis,
    intent,
    computedData,
    vizPlan
  );

  return {
    userInput,
    intent,
    datasetSummary: summary,
    computedData,
    vizPlan,
    insights,
    processingTimeMs: Date.now() - startTime,
    datasetIntelligence,
    queryClassification,
  };
}


// 🔥 DATA ENGINE (no LLM here)
function computeData(intent, analysis) {
  const {
    analysisType: requestedAnalysisType,
    targetColumns = [],
    groupBy,
    aggregation,
    topN,
    sortOrder
  } = intent;
  const analysisType =
    requestedAnalysisType === "summary" && (groupBy || intent.xAxis) && (intent.yAxis || targetColumns.length)
      ? "comparison"
      : requestedAnalysisType;

  const dataset = analysis.cleanedDataset;
  const resolveNumericColumn = (column) => {
    if (!column) return null;
    if (analysis.numericColumns.includes(column)) return column;
    const inner = String(column).match(/\(([^)]+)\)/)?.[1];
    if (inner && analysis.numericColumns.includes(inner)) return inner;
    return analysis.numericColumns.find(c => c.toLowerCase() === String(column).toLowerCase()) || null;
  };
  const getValueColumn = (exclude = []) =>
    resolveNumericColumn(intent.yAxis) ||
    targetColumns.find(c => analysis.numericColumns.includes(c) && !exclude.includes(c) && c.trim() !== "") ||
    analysis.numericColumns.find(c => !exclude.includes(c) && c.trim() !== "") ||
    analysis.numericColumns.find(c => !exclude.includes(c));

  const toChartRows = (rows, groupCol, valueCol) =>
    rows.map(row => ({
      [groupCol]: normalizeGroupValue(row[groupCol]),
      [valueCol]: row.sum
    }));

  try {
    // SUMMARY
    if (analysisType === "summary") {
      return Object.entries(analysis.numericStats).map(([column, stats]) => ({
        column,
        count: stats.count,
        sum: stats.sum,
        mean: stats.mean,
        min: stats.min,
        max: stats.max,
      }));
    }

    // DISTRIBUTION
    if (analysisType === "distribution") {
      const col = targetColumns[0] || analysis.numericColumns[0];
      if (!col) return [];

      if (analysis.numericColumns.includes(col)) {
        return buildHistogramBuckets(
          dataset.map(r => r[col]).filter(v => v != null),
          10
        );
      }

      return getValueCounts(dataset, col);
    }

    // CORRELATION
    if (analysisType === "correlation") {
      const colA = targetColumns[0] || analysis.numericColumns[0];
      const colB = targetColumns[1] || analysis.numericColumns[1];
      if (!colA || !colB) return [];

      return dataset
        .map(r => ({ x: r[colA], y: r[colB] }))
        .filter(p => p.x != null && p.y != null)
        .slice(0, 200);
    }

    // TREND
    if (analysisType === "trend") {
      const dateCol =
        targetColumns.find(c => analysis.datetimeColumns.includes(c)) ||
        analysis.datetimeColumns[0];

      const periodCol =
        dateCol ||
        groupBy ||
        intent.xAxis ||
        targetColumns.find(c => c && c !== intent.yAxis) ||
        analysis.categoricalColumns[0];

      const valueCol =
        getValueColumn([periodCol]);

      if (!periodCol || !valueCol) return [];

      if (dateCol) {
        return timeSeries(dataset, dateCol, valueCol)
          .map(row => ({ [dateCol]: row.date, [valueCol]: row.value }));
      }

      return toChartRows(
        sortGroupedRows(groupByAggregate(dataset, periodCol, valueCol), periodCol, "asc"),
        periodCol,
        valueCol
      );
    }

    // COMPARISON / AGGREGATION
    if (analysisType === "comparison" || analysisType === "aggregation") {
      const grpCol =
        groupBy ||
        intent.xAxis ||
        targetColumns.find(c => analysis.categoricalColumns.includes(c));

      const valCol = getValueColumn([grpCol]);

      if (!grpCol || !valCol) return [];

      const agg = groupByAggregate(dataset, grpCol, valCol);
      return toChartRows(sortOrder === "asc" ? agg.reverse() : agg, grpCol, valCol);
    }

    // TOP N / RANKING
    if (analysisType === "top_n" || analysisType === "ranking") {
      const grpCol =
        groupBy ||
        intent.xAxis ||
        targetColumns.find(c => analysis.categoricalColumns.includes(c));

      const valCol = getValueColumn([grpCol]);

      if (!grpCol || !valCol) return [];

      const agg = groupByAggregate(dataset, grpCol, valCol);
      return toChartRows((sortOrder === "asc" ? agg.reverse() : agg).slice(0, topN || 10), grpCol, valCol);
    }

    // OUTLIERS
    if (analysisType === "outlier") {
      const col = targetColumns[0] || analysis.numericColumns[0];
      if (!col) return [];

      const values = dataset.map(r => r[col]).filter(v => v != null);
      const stats = aggregateNumeric(values);

      return dataset
        .filter(r => r[col] != null)
        .map(r => ({
          ...r,
          zScore: ((r[col] - stats.mean) / stats.stddev).toFixed(2)
        }))
        .filter(r => Math.abs(r.zScore) > 2.5)
        .slice(0, 50);
    }

    return dataset.slice(0, 50);

  } catch (e) {
    return { error: e.message };
  }
}

function normalizeGroupValue(value) {
  if (value === null || value === undefined) return "Unknown";
  const month = Number(value);
  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  }
  return value;
}

function sortGroupedRows(rows, groupCol, sortOrder) {
  const direction = sortOrder === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const aNum = Number(a[groupCol]);
    const bNum = Number(b[groupCol]);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return (aNum - bNum) * direction;
    return String(a[groupCol]).localeCompare(String(b[groupCol])) * direction;
  });
}


// 🔧 HISTOGRAM HELPER
function buildHistogramBuckets(values, bucketCount) {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const bucketSize = (max - min) / bucketCount || 1;

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    range: `${(min + i * bucketSize).toFixed(1)}-${(min + (i + 1) * bucketSize).toFixed(1)}`,
    count: 0,
    min: min + i * bucketSize,
    max: min + (i + 1) * bucketSize
  }));

  for (const v of values) {
    const idx = Math.min(
      Math.floor((v - min) / bucketSize),
      bucketCount - 1
    );
    buckets[idx].count++;
  }

  return buckets;
}

module.exports = { runAgent };
