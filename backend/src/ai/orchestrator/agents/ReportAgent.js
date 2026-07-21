const { analyzeConsumption } = require("../../modules/consumptionAnalyzer");

/**
 * ReportAgent
 * Wrapper agent reusing consumptionAnalyzer module.
 */
class ReportAgent {
  async generate({ dataset, intelligence, analysis }) {
    const domain = (intelligence?.dataset?.domain || "").toLowerCase();
    const isGroceryDomain = domain === "grocery" || domain === "expense";

    if (isGroceryDomain && Array.isArray(dataset) && dataset.length > 0) {
      return analyzeConsumption(dataset);
    }

    return null;
  }
}

module.exports = new ReportAgent();
