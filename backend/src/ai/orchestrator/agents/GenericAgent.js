const { buildRecommendations, buildNextQuestions, buildInsights } = require("../../modules/dashboardGenerator");

/**
 * GenericAgent
 * Fallback domain agent for general or unclassified datasets.
 * Pluggable architecture: reuses generic dashboard generation.
 */
class GenericAgent {
  /**
   * Process Generic domain intelligence
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Generic domain intelligence object
   */
  async process({ dataset, intelligence, analysis, dashboard }) {
    const domain = (intelligence?.dataset?.domain || "Generic").trim();
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

module.exports = new GenericAgent();
