const { generateRecommendations } = require("../../modules/recommendationEngine");

/**
 * RecommendationAgent
 * Wrapper agent reusing recommendationEngine module.
 */
class RecommendationAgent {
  async generate({ dataset, intelligence, analysis, dashboard }) {
    const domain = (intelligence?.dataset?.domain || "").toLowerCase();
    const isGroceryDomain = domain === "grocery" || domain === "expense";

    if (isGroceryDomain && Array.isArray(dataset) && dataset.length > 0) {
      return generateRecommendations(dataset);
    }

    if (dashboard && dashboard.recommendations) {
      return dashboard.recommendations;
    }

    return null;
  }
}

module.exports = new RecommendationAgent();
