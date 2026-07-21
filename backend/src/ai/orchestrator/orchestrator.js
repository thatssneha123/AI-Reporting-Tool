const datasetAgent = require("./agents/DatasetAgent");
const dashboardAgent = require("./agents/DashboardAgent");
const insightAgent = require("./agents/InsightAgent");
const domainAgent = require("./agents/DomainAgent");
const plannerAgent = require("./agents/PlannerAgent");
const executiveSummaryAgent = require("./agents/ExecutiveSummaryAgent");

/**
 * AI Orchestrator
 * Coordinates execution across specialized agents (DatasetAgent, PlannerAgent, DomainAgent, InsightAgent, ExecutiveSummaryAgent, DashboardAgent)
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

    // 2. Call PlannerAgent to dynamically decide execution plan
    const executionPlan = plannerAgent.createPlan(datasetProfile);

    let domainIntelligence = null;
    let insights = null;
    let executiveSummary = null;

    // 3. Dynamically execute planned agents according to execution plan
    if (executionPlan.plan.includes("DomainAgent")) {
      domainIntelligence = await domainAgent.process({
        dataset,
        intelligence,
        analysis,
      });
    }

    if (executionPlan.plan.includes("InsightAgent")) {
      insights = await insightAgent.generate({
        dataset,
        intelligence,
        analysis,
      });
    }

    if (executionPlan.plan.includes("ExecutiveSummaryAgent")) {
      executiveSummary = executiveSummaryAgent.generate({
        datasetProfile,
        domainIntelligence,
        insights,
      });
    }

    // 4. Call DashboardAgent to assemble the complete structured dashboard object
    const dashboard = await dashboardAgent.assemble({
      datasetProfile,
      domainIntelligence,
      insights,
      executiveSummary,
    });

    return {
      ...dashboard,
      executionPlan,
    };
  }
}

module.exports = new Orchestrator();
