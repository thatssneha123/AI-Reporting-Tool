const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * HealthcareAgent
 * Specialized domain agent for Healthcare and Medical datasets.
 * Pluggable architecture: initially reuses generic dashboard generation.
 */
class HealthcareAgent {
  /**
   * Process Healthcare domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Healthcare domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = "Healthcare";
    const schema = intelligence?.schema || {};
    const quality = intelligence?.quality || {};

    const aiSuggestions = buildRecommendations(domain, schema, quality);
    const suggestedQuestions = buildNextQuestions(domain, schema);
    const domainInsights = buildInsights(domain, schema, quality);

    return {
      domain,
      domainType: "Healthcare Intelligence",
      isGroceryDomain: false,
      consumptionReport: null,
      recommendationReport: null,
      aiSuggestions,
      suggestedQuestions,
      domainInsights,
    };
  }
}

module.exports = new HealthcareAgent();
