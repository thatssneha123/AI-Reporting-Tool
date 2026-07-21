/**
 * PlannerAgent
 * Intelligently plans and decides which AI agents should execute based on dataset profile and domain.
 * Does NOT contain business logic — only coordinates agent selection and plan creation.
 */
class PlannerAgent {
  /**
   * Create an execution plan based on dataset profile and domain
   * @param {Object} datasetProfile - Output from DatasetAgent
   * @returns {Object} Execution plan containing selected agents and step sequence
   */
  createPlan(datasetProfile) {
    const domain = (datasetProfile?.domain || "Generic").trim();
    const domainLower = domain.toLowerCase();

    // Default base agent
    const selectedAgents = ["DatasetAgent"];

    // Domain-specific agent selection rules
    if (domainLower === "grocery" || domainLower === "expense") {
      selectedAgents.push("DomainAgent", "InsightAgent", "DashboardAgent");
    } else if (domainLower === "movies" || domainLower === "media" || domainLower === "netflix") {
      selectedAgents.push("DomainAgent", "InsightAgent", "DashboardAgent");
    } else if (domainLower === "sales" || domainLower === "orders") {
      selectedAgents.push("DomainAgent", "InsightAgent", "DashboardAgent");
    } else {
      // Generic or unknown datasets
      selectedAgents.push("InsightAgent", "DashboardAgent");
    }

    const steps = selectedAgents.map((agentName, index) => ({
      step: index + 1,
      agent: agentName,
      status: index === 0 ? "completed" : "pending",
    }));

    return {
      domain,
      datasetType: datasetProfile?.datasetType || "Dataset",
      plan: selectedAgents,
      steps,
      plannedAt: new Date().toISOString(),
    };
  }
}

module.exports = new PlannerAgent();
