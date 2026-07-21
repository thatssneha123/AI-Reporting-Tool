const datasetAgent = require("./agents/DatasetAgent");
const dashboardAgent = require("./agents/DashboardAgent");
const insightAgent = require("./agents/InsightAgent");
const domainAgent = require("./agents/DomainAgent");

/**
 * AI Orchestrator
 * Coordinates execution across specialized agents (DatasetAgent, DomainAgent, InsightAgent, DashboardAgent)
 * while reusing existing modules.
 */
class Orchestrator {
  /**
   * Process a dataset and generate a structured dashboard object
   * @param {string|Array} input - File path string or raw dataset array
   * @param {Object} options - Optional parameters (filename, fileType, etc.)
   * @returns {Promise<Object>} Combined structured dashboard object
   */
  async processDataset(input, options = {}) {
    // 1. Call DatasetAgent to parse dataset & extract dataset profile & intelligence
    const datasetProfile = await datasetAgent.process(input, options);
    const { dataset, intelligence, analysis } = datasetProfile;

    // 2. Call DomainAgent to route domain intelligence (Grocery, Sales, Finance, HR, etc.)
    const domainIntelligence = await domainAgent.process({
      dataset,
      intelligence,
      analysis,
    });

    // 3. Call InsightAgent to compile business insights
    const insights = await insightAgent.generate({
      dataset,
      intelligence,
      analysis,
    });

    // 4. Call DashboardAgent to assemble the complete structured dashboard object
    const dashboard = await dashboardAgent.assemble({
      datasetProfile,
      domainIntelligence,
      insights,
    });

    return dashboard;
  }
}

module.exports = new Orchestrator();
