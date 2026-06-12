const { callLLMJson } = require("../services/llmService");
const fs = require("fs");
const path = require("path");

let vizSystemPrompt = "";
try {
  vizSystemPrompt = fs.readFileSync(
    path.join(__dirname, "../prompts/visualizationPrompt.txt"),
    "utf-8"
  );
} catch {
  vizSystemPrompt = "You are a data visualization expert. Return only valid JSON.";
}

async function planVisualization(intent, analysis, computedData) {
  const context = {
    intent,
    dataShape: {
      rowCount: analysis.rowCount,
      numericColumns: analysis.numericColumns,
      categoricalColumns: analysis.categoricalColumns,
      datetimeColumns: analysis.datetimeColumns,
    },
    computedDataSample: Array.isArray(computedData)
      ? computedData.slice(0, 5)
      : computedData,
  };

  const result = await callLLMJson(vizSystemPrompt, JSON.stringify(context));
  return validateVisualizationPlan(result, intent, analysis);
}

function ruleBasedChartType(intent, analysis) {
  const { analysisType, chartHint, targetColumns, groupBy } = intent;

  if (chartHint && chartHint !== "none") return chartHint;

  if (analysisType === "trend" && analysis.datetimeColumns.length > 0) return "line";
  if (analysisType === "distribution") return "histogram";
  if (analysisType === "correlation") return "scatter";
  if (analysisType === "comparison" && groupBy) return "bar";
  if (analysisType === "top_n") return "bar";

  const numericCount = targetColumns.filter((c) =>
    analysis.numericColumns.includes(c)
  ).length;
  const categoricalCount = targetColumns.filter((c) =>
    analysis.categoricalColumns.includes(c)
  ).length;

  if (numericCount >= 2) return "scatter";
  if (categoricalCount >= 1 && numericCount >= 1) return "bar";
  if (categoricalCount >= 1) return "pie";
  return "bar";
}

function validateVisualizationPlan(plan, intent, analysis) {
  const validTypes = ["bar", "line", "scatter", "pie", "histogram", "heatmap", "box", "area", "table"];
  const fallbackType = ruleBasedChartType(intent, analysis);

  return {
    chartType: validTypes.includes(plan.chartType) ? plan.chartType : fallbackType,
    xAxis: plan.xAxis || intent.targetColumns[0] || null,
    yAxis: plan.yAxis || intent.targetColumns[1] || null,
    colorBy: plan.colorBy || intent.groupBy || null,
    title: plan.title || `${intent.analysisType} Analysis`,
    description: plan.description || "",
    aggregationMethod: plan.aggregationMethod || intent.aggregation || "sum",
    sortBy: plan.sortBy || "value",
    limit: plan.limit || intent.topN || 20,
    annotations: Array.isArray(plan.annotations) ? plan.annotations : [],
  };
}

module.exports = { planVisualization, ruleBasedChartType };