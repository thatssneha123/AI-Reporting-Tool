const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * SalesAgent
 * Specialized domain agent for Sales and Orders datasets.
 * Pluggable architecture: initially reuses generic dashboard generation.
 */
class SalesAgent {
  /**
   * Process Sales domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Sales domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = "Sales";
    const schema = intelligence?.schema || {};
    const quality = intelligence?.quality || {};

    const aiSuggestions = buildRecommendations(domain, schema, quality);
    const suggestedQuestions = buildNextQuestions(domain, schema);
    const domainInsights = buildInsights(domain, schema, quality);

    return {
      domain,
      domainType: "Sales Intelligence",
      isGroceryDomain: false,
      consumptionReport: null,
      recommendationReport: null,
      aiSuggestions,
      suggestedQuestions,
      domainInsights,
    };
  }
}

module.exports = new SalesAgent();
