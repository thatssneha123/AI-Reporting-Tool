const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * FinanceAgent
 * Specialized domain agent for Financial and Revenue datasets.
 * Pluggable architecture: initially reuses generic dashboard generation.
 */
class FinanceAgent {
  /**
   * Process Finance domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Finance domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = "Finance";
    const schema = intelligence?.schema || {};
    const quality = intelligence?.quality || {};

    const aiSuggestions = buildRecommendations(domain, schema, quality);
    const suggestedQuestions = buildNextQuestions(domain, schema);
    const domainInsights = buildInsights(domain, schema, quality);

    return {
      domain,
      domainType: "Finance Intelligence",
      isGroceryDomain: false,
      consumptionReport: null,
      recommendationReport: null,
      aiSuggestions,
      suggestedQuestions,
      domainInsights,
    };
  }
}

module.exports = new FinanceAgent();
