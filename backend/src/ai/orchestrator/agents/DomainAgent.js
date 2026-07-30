const groceryAgent = require("./GroceryAgent");
const salesAgent = require("./SalesAgent");
const hrAgent = require("./HRAgent");
const financeAgent = require("./FinanceAgent");
const healthcareAgent = require("./HealthcareAgent");
const genericAgent = require("./GenericAgent");

/**
 * DomainAgent
 * Central Domain Intelligence router featuring a pluggable agent registry.
 * Registers and delegates execution to specialized domain agents (GroceryAgent, SalesAgent, HRAgent, FinanceAgent, HealthcareAgent, GenericAgent).
 */
class DomainAgent {
  constructor() {
    this.agents = new Map();
    
    // Register domain agents
    this.registerAgent("grocery", groceryAgent);
    this.registerAgent("expense", groceryAgent);
    this.registerAgent("sales", salesAgent);
    this.registerAgent("orders", salesAgent);
    this.registerAgent("hr", hrAgent);
    this.registerAgent("workforce", hrAgent);
    this.registerAgent("finance", financeAgent);
    this.registerAgent("healthcare", healthcareAgent);
    this.registerAgent("medical", healthcareAgent);
    this.registerAgent("generic", genericAgent);
  }

  /**
   * Register a pluggable domain agent
   * @param {string} domainName 
   * @param {Object} agentInstance 
   */
  registerAgent(domainName, agentInstance) {
    if (domainName && agentInstance) {
      this.agents.set(domainName.trim().toLowerCase(), agentInstance);
    }
  }

  /**
   * Retrieve the matching domain agent for a given domain and dataset
   * @param {string} domainName 
   * @param {Array} dataset 
   * @returns {Object} Matching domain agent instance
   */
  getAgent(domainName, dataset) {
    const key = String(domainName || "generic").trim().toLowerCase();

    // 1. Explicit registered domain lookup (grocery, sales, hr, finance, healthcare, etc.)
    if (this.agents.has(key)) {
      return this.agents.get(key);
    }

    // 2. Fallback heuristic check for grocery data ONLY when domain is generic/unclassified
    if (groceryAgent.isGroceryData && groceryAgent.isGroceryData(dataset)) {
      return groceryAgent;
    }

    // 3. Default fallback
    return genericAgent;
  }

  /**
   * Process dataset domain intelligence via registered pluggable domain agents
   * @param {Object} params - { dataset, intelligence, analysis, dashboard }
   * @returns {Promise<Object>} Structured Domain Intelligence object
   */
  async process(params = {}) {
    const { dataset, intelligence } = params;
    const domain = (intelligence?.dataset?.domain || params.domain || "Generic").trim();
    const agent = this.getAgent(domain, dataset);
    return await agent.process(params);
  }
}

module.exports = new DomainAgent();
