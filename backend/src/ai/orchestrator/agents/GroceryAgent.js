const { analyzeConsumption } = require("../../modules/consumptionAnalyzer");
const { generateRecommendations } = require("../../modules/recommendationEngine");

/**
 * GroceryAgent
 * Specialized domain agent for Grocery and Expense datasets.
 * Encapsulates existing consumption and recommendation logic without duplication.
 */
class GroceryAgent {
  /**
   * Process Grocery / Expense domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Grocery domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return null;
    }

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

  /**
   * Helper: Check if dataset rows contain grocery/expense product keywords
   * @param {Array} dataset 
   * @returns {boolean}
   */
  isGroceryData(dataset) {
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
}

module.exports = new GroceryAgent();
