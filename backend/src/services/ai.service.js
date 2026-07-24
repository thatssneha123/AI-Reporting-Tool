const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const { runAgent } = require("../ai/agents/aiAgent");
const { loadDataset } = require("../ai/modules/datasetLoader");
const { analyzeDatasetIntelligence } = require("../ai/modules/datasetIntelligenceAgent");
const { analyzeDataset, summarizeAnalysis } = require("../ai/modules/datasetAnalyzer");
const { normalizeQuery } = require("../ai/utils/queryNormalizer");
const { generateRecommendations } = require("../ai/modules/recommendationEngine");
const { analyzeConsumption } = require("../ai/modules/consumptionAnalyzer");
const { classifyQuery, generateDashboardIntents } = require("../ai/modules/queryClassifier");
const { generateDashboard, shouldTriggerDashboard, buildNextQuestions } = require("../ai/modules/dashboardGenerator");
const { computeAllChartData } = require("../ai/modules/dashboardDataCompute");

const orchestrator = require("../ai/orchestrator/orchestrator");

const toAbsolutePath = (filePath) => path.isAbsolute(filePath)
  ? filePath
  : path.resolve(process.cwd(), filePath);

const normalizeAiResult = (result) => {
  const bulletPoints = Array.isArray(result.insights?.bulletPoints)
    ? result.insights.bulletPoints
    : [];

  const domain = result.datasetIntelligence?.dataset?.domain || "Generic";
  const schema = result.datasetIntelligence?.schema || {};
  const suggestedQuestions = buildNextQuestions(domain, schema);

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
    datasetIntelligence: result.datasetIntelligence || null,
    questions: {
      type: "questions",
      title: "Suggested Next Questions",
      questions: suggestedQuestions,
    },
  };
};

const analyzeFileWithAi = async ({ filePath, query }) => {
  console.log("analyzeFileWithAi called");
  const absolutePath = toAbsolutePath(filePath);

  // Check if this should be a dashboard (empty or vague query)
  const isDashboardMode = shouldTriggerDashboard(query);

  if (isDashboardMode) {
    // WORKFLOW 1: Automatic Dashboard via AI Orchestrator
    console.log("Generating automatic dashboard via AI Orchestrator");
    return await orchestrator.processDataset(absolutePath);
  }

  // WORKFLOW 2: Single-Chart Analysis (existing behavior)
  const dataset = await loadDataset(absolutePath);
  const datasetIntelligence = analyzeDatasetIntelligence(dataset, {
    filename: path.basename(absolutePath),
    fileType: path.extname(absolutePath).replace(".", ""),
  });

  // Classify query to determine mode (dashboard vs specific)
  const queryClassification = classifyQuery(query);
  
  const normalizedQuery = normalizeQuery(query || "Summarize this dataset");
  
  // Pass intelligence and classification context to agent
  const result = await runAgent(normalizedQuery, dataset, {
    datasetIntelligence,
    queryClassification,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  const aiResult = normalizeAiResult({ ...result, datasetIntelligence });

  // Only attach grocery reports if the dataset is actually a grocery/expense dataset
  const singleChartDomain = (datasetIntelligence.dataset?.domain || "").toLowerCase();
  const isSingleChartGrocery = singleChartDomain === "grocery" || singleChartDomain === "expense";

  if (isSingleChartGrocery) {
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
