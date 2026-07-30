/**
 * PlannerAgent
 * Intelligently plans and decides which AI agents should execute based on dataset profile and domain.
 * Does NOT contain business logic — only coordinates agent selection and plan creation.
 */
class PlannerAgent {
  /**
   * Determine domain agent name from domain classification
   * @param {string} domainLower 
   * @returns {string} Domain agent class name
   */
  getDomainAgentName(domainLower) {
    if (domainLower === "grocery" || domainLower === "expense") {
      return "GroceryAgent";
    }
    if (domainLower === "sales" || domainLower === "orders") {
      return "SalesAgent";
    }
    if (domainLower === "hr" || domainLower === "workforce") {
      return "HRAgent";
    }
    if (domainLower === "finance" || domainLower === "financial") {
      return "FinanceAgent";
    }
    if (domainLower === "healthcare" || domainLower === "medical") {
      return "HealthcareAgent";
    }
    return "GenericAgent";
  }

  /**
   * Create an execution plan based on dataset profile and domain
   * @param {Object} datasetProfile - Output from DatasetAgent
   * @returns {Object} Execution plan containing selected agents and step sequence
   */
  createPlan(datasetProfile) {
    const domain = (datasetProfile?.domain || "Generic").trim();
    const domainLower = domain.toLowerCase();

    // Default base agents
    const selectedAgents = ["DatasetAgent", "ExecutiveSummaryAgent"];

    // Automatically choose pluggable domain agent
    const specificDomainAgent = this.getDomainAgentName(domainLower);
    selectedAgents.push("DomainAgent", specificDomainAgent, "InsightAgent", "DashboardAgent", "MemoryAgent");

    const steps = selectedAgents.map((agentName, index) => ({
      step: index + 1,
      agent: agentName,
      status: index === 0 ? "completed" : "pending",
    }));

    return {
      domain,
      datasetType: datasetProfile?.datasetType || "Dataset",
      selectedDomainAgent: specificDomainAgent,
      plan: selectedAgents,
      steps,
      plannedAt: new Date().toISOString(),
    };
  }
}

module.exports = new PlannerAgent();
