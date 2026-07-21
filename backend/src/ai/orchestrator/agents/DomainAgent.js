const { analyzeConsumption } = require("../../modules/consumptionAnalyzer");
const { generateRecommendations } = require("../../modules/recommendationEngine");
const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * DomainAgent
 * Domain Intelligence layer that routes execution based on dataset domain (Grocery, Sales, Finance, HR, Healthcare, Education, Movies, Generic).
 * Reuses existing consumptionAnalyzer, recommendationEngine, and dashboardGenerator functions without duplicating logic.
 */
class DomainAgent {
  /**
   * Process dataset domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Structured Domain Intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = (intelligence?.dataset?.domain || "Generic").trim();
    const domainLower = domain.toLowerCase();
    const isGroceryDomain = domainLower === "grocery" || domainLower === "expense" || isGroceryData(dataset);

    // 1. Grocery / Expense Domain Routing
    if (isGroceryDomain && Array.isArray(dataset) && dataset.length > 0) {
      const consumptionReport = analyzeConsumption(dataset);
      const recommendationReport = generateRecommendations(dataset);

      const aiSuggestions = recommendationReport.recommendations || [
        "Track spending by category and identify savings opportunities.",
        "Monitor purchase frequency and seasonal patterns.",
      ];

      const suggestedQuestions = [
        "What's my spending by category?",
        "Where am I spending the most?",
        "What are my purchase patterns?",
      ];

      return {
        domain: "Grocery",
        domainType: "Grocery Consumption & Health Intelligence",
        isGroceryDomain: true,
        consumptionReport,
        recommendationReport,
        metrics: {
          totalSpend: consumptionReport.totalSpend,
          healthySpend: consumptionReport.healthySpend,
          unhealthySpend: consumptionReport.unhealthySpend,
          healthScore: consumptionReport.healthScore,
          estimatedSavings: consumptionReport.estimatedSavings,
        },
        items: {
          healthyItems: recommendationReport.healthyItems || [],
          unhealthyItems: recommendationReport.unhealthyItems || [],
          swadeshiAlternatives: recommendationReport.swadeshiAlternatives || [],
        },
        aiSuggestions,
        suggestedQuestions,
      };
    }

    // 2. Generic / Other Domain Routing (Sales, Finance, HR, Healthcare, Education, Movies, etc.)
    const schema = intelligence?.schema || {};
    const quality = intelligence?.quality || {};

    const aiSuggestions = buildRecommendations(domain, schema, quality);
    const suggestedQuestions = buildNextQuestions(domain, schema);
    const domainInsights = buildInsights(domain, schema, quality);

    return {
      domain,
      domainType: `${domain} Intelligence`,
      isGroceryDomain: false,
      consumptionReport: null,
      recommendationReport: null,
      aiSuggestions,
      suggestedQuestions,
      domainInsights,
    };
  }
}

/**
 * Helper: Check if dataset rows contain grocery/expense product keywords
 */
function isGroceryData(dataset) {
  if (!Array.isArray(dataset) || dataset.length === 0) return false;
  const sample = dataset.slice(0, 15);
  const keys = Object.keys(sample[0] || {}).map((k) => k.toLowerCase());
  const hasItemCol = keys.some((k) => ["item", "product", "product_name", "grocery", "bill"].includes(k));
  if (!hasItemCol) return false;

  const itemsText = sample
    .map((r) => String(r.item || r.product || r.product_name || "").toLowerCase())
    .join(" ");

  return /maggi|milk|bread|rice|flour|maida|vegetable|fruit|coke|pepsi|butter|cheese|grocery|biscuit|noodle/i.test(itemsText);
}

module.exports = new DomainAgent();
