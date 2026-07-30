const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * HRAgent
 * Specialized domain agent for HR and Workforce datasets.
 * Pluggable architecture: initially reuses generic dashboard generation.
 */
class HRAgent {
  /**
   * Process HR domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} HR domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = "HR";
    const schema = intelligence?.schema || {};
    const quality = intelligence?.quality || {};

    const aiSuggestions = buildRecommendations(domain, schema, quality);
    const suggestedQuestions = buildNextQuestions(domain, schema);
    const domainInsights = buildInsights(domain, schema, quality);

    return {
      domain,
      domainType: "HR Intelligence",
      isGroceryDomain: false,
      consumptionReport: null,
      recommendationReport: null,
      aiSuggestions,
      suggestedQuestions,
      domainInsights,
    };
  }
}

module.exports = new HRAgent();
