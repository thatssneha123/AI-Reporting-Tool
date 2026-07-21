/**
 * InsightAgent
 * Wrapper agent for generating business insights from dashboard structure.
 */
class InsightAgent {
  async generate({ dataset, intelligence, analysis, dashboard }) {
    if (dashboard && dashboard.insights) {
      return dashboard.insights;
    }

    return {
      type: "insights",
      title: "Business Insights",
      insights: [],
    };
  }
}

module.exports = new InsightAgent();
