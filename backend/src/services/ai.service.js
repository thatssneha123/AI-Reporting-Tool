const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const { runAgent } = require("../ai/agents/aiAgent");
const { loadDataset } = require("../ai/modules/datasetLoader");
const { analyzeDataset, summarizeAnalysis } = require("../ai/modules/datasetAnalyzer");
const { normalizeQuery } = require("../ai/utils/queryNormalizer");
const { generateRecommendations } = require("../ai/modules/recommendationEngine");
const { analyzeConsumption } = require("../ai/modules/consumptionAnalyzer");

const toAbsolutePath = (filePath) => path.isAbsolute(filePath)
  ? filePath
  : path.resolve(process.cwd(), filePath);

const normalizeAiResult = (result) => {
  const bulletPoints = Array.isArray(result.insights?.bulletPoints)
    ? result.insights.bulletPoints
    : [];

  return {
    intent: result.intent,
    chartType: result.vizPlan?.chartType || result.intent?.chartType || "bar",
    chartData: Array.isArray(result.computedData) ? result.computedData : [],
    insights: bulletPoints.length ? bulletPoints.join("\n") : "No insights available",
    insightBullets: bulletPoints,
    datasetSummary: result.datasetSummary,
    vizPlan: result.vizPlan,
    computedData: result.computedData,
    processingTimeMs: result.processingTimeMs,
  };
};

const analyzeFileWithAi = async ({ filePath, query }) => {
  console.log("analyzeFileWithAi called");
  const absolutePath = toAbsolutePath(filePath);
  const dataset = await loadDataset(absolutePath);
  const normalizedQuery = normalizeQuery(query || "Summarize this dataset");
  const result = await runAgent(normalizedQuery, dataset);

if (result.error) {
  throw new Error(result.error);
}

const aiResult = normalizeAiResult(result);

const lowerQuery = normalizedQuery.toLowerCase();

if (
  lowerQuery.includes("grocery") ||
  lowerQuery.includes("bill") ||
  lowerQuery.includes("consumption") ||
  lowerQuery.includes("recommendation")
) {
  return {
    ...aiResult,
    consumptionReport: analyzeConsumption(dataset),
    recommendationReport: generateRecommendations(dataset),
  };
}

return aiResult;
};

const summarizeFileWithAi = async (filePath) => {
  console.log("summarizeFileWithAi called");
  const dataset = await loadDataset(toAbsolutePath(filePath));
  const analysis = analyzeDataset(dataset);

  if (analysis.error) {
    throw new Error(analysis.error);
  }

  const consumptionReport = analyzeConsumption(dataset);
const recommendationReport = generateRecommendations(dataset);

console.log("Consumption:", consumptionReport);
console.log("Recommendation:", recommendationReport);

return {
  datasetSummary: summarizeAnalysis(analysis),
  consumptionReport,
  recommendationReport,
};
};

module.exports = {
  analyzeFileWithAi,
  summarizeFileWithAi,
};
