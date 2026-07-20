/**
 * AgentOrchestrator - Central coordinator for the AI agent pipeline
 * 
 * Routes requests through the appropriate agents based on query classification.
 * Manages the AgentContext lifecycle, coordinates agent execution order,
 * and merges agent outputs into the final response shape.
 * 
 * CRITICAL: The orchestrator produces the SAME response contract as the existing
 * ai.service.js. New fields are additive only — no breaking changes.
 */

const AgentContext = require("./agentContext");
const AgentRegistry = require("./agentRegistry");
const AgentLogger = require("./agentLogger");

class AgentOrchestrator {
  /**
   * @param {Object} [options]
   * @param {AgentLogger} [options.logger]
   */
  constructor(options = {}) {
    this.registry = new AgentRegistry();
    this.logger = options.logger || new AgentLogger();
  }

  /**
   * Register an agent with the orchestrator
   * @param {import('./baseAgent')} agent
   * @returns {AgentOrchestrator} this (for chaining)
   */
  registerAgent(agent) {
    this.registry.register(agent);
    return this;
  }

  /**
   * Run the full agent pipeline for a request.
   * 
   * @param {Object} request
   * @param {string} request.filePath - Absolute path to the dataset file
   * @param {string} request.query - User's query (empty string for dashboard mode)
   * @param {string} [request.datasetId] - MongoDB dataset ID
   * @returns {Promise<Object>} Final response in the same shape as ai.service.js
   */
  async run(request) {
    const context = new AgentContext(request);
    const startTime = Date.now();

    this.logger.orchestrator(
      `Starting pipeline — mode: ${context.isDashboardMode ? "Dashboard" : "Analyze"}, ` +
      `query: "${context.query || "(empty)"}"`
    );

    try {
      // 1. Determine which agents to run based on mode
      const agentNames = this._selectAgents(context);
      this.logger.orchestrator(`Selected agents: ${agentNames.join(", ")}`);

      // 2. Resolve execution order based on dependencies
      const orderedAgents = this.registry.resolveExecutionOrder(agentNames);
      this.logger.orchestrator(
        `Execution order: ${orderedAgents.map(a => a.name).join(" → ")}`
      );

      // 3. Run agents sequentially in dependency order
      for (const agent of orderedAgents) {
        await this._runAgent(agent, context);
      }

      // 4. Log pipeline summary
      this.logger.pipelineSummary(context);

      // 5. Build response from context
      return this._buildResponse(context);

    } catch (error) {
      this.logger.agentError("Orchestrator", error);
      throw error;
    }
  }

  /**
   * Select which agents to run based on the request mode.
   * @param {AgentContext} context
   * @returns {string[]} Agent names to include in this pipeline run
   * @private
   */
  _selectAgents(context) {
    // SchemaAgent always runs (both modes need dataset profiling)
    const agents = ["SchemaAgent"];

    if (context.isDashboardMode) {
      // Dashboard mode: full dashboard generation pipeline
      agents.push("DashboardAgent", "DomainAgent");
    } else {
      // Analyze mode: single-chart analysis pipeline
      agents.push("IntentAgent", "ComputeAgent", "VizAgent", "InsightAgent", "DomainAgent");
    }

    // NarrativeAgent is optional and additive — include if registered
    if (this.registry.has("NarrativeAgent")) {
      agents.push("NarrativeAgent");
    }

    // Only include agents that are actually registered
    return agents.filter(name => this.registry.has(name));
  }

  /**
   * Run a single agent with timing, error handling, and prerequisite checking.
   * @param {import('./baseAgent')} agent
   * @param {AgentContext} context
   * @private
   */
  async _runAgent(agent, context) {
    // Check prerequisites
    const prereqs = agent.checkPrerequisites(context);
    if (!prereqs.satisfied) {
      this.logger.agentSkip(
        agent.name,
        `Missing prerequisites: ${prereqs.missing.join(", ")}`
      );
      context.addError(agent.name, `Skipped — missing: ${prereqs.missing.join(", ")}`);
      return;
    }

    const agentStart = Date.now();
    this.logger.agentStart(agent.name);

    try {
      await agent.run(context);
      const duration = Date.now() - agentStart;
      context.recordTiming(agent.name, duration);
      this.logger.agentComplete(agent.name, duration);

      // Validate output
      const output = agent.validateOutput(context);
      if (!output.valid) {
        this.logger.warn(
          `${agent.name} did not produce expected keys: ${output.missing.join(", ")}`
        );
      }
    } catch (error) {
      const duration = Date.now() - agentStart;
      context.recordTiming(agent.name, duration);
      context.addError(agent.name, error);
      this.logger.agentError(agent.name, error);
      // Non-fatal: pipeline continues with remaining agents
    }
  }

  /**
   * Build the final response object from AgentContext.
   * MUST produce the same shape as the existing ai.service.js responses.
   * 
   * @param {AgentContext} context
   * @returns {Object} Response matching existing API contract
   * @private
   */
  _buildResponse(context) {
    if (context.isDashboardMode) {
      return this._buildDashboardResponse(context);
    }
    return this._buildAnalyzeResponse(context);
  }

  /**
   * Build dashboard mode response.
   * Must match the shape from ai.service.js dashboard path.
   * @private
   */
  _buildDashboardResponse(context) {
    const dashboard = context.dashboard || {};
    const domainReports = context.domainReports || {};

    const response = {
      ...dashboard,
      ...(domainReports.consumptionReport
        ? { consumptionReport: domainReports.consumptionReport }
        : {}),
      ...(domainReports.recommendationReport
        ? { recommendationReport: domainReports.recommendationReport }
        : {}),
    };

    // Additive: include narrative if available
    if (context.narrative) {
      response.narrative = context.narrative;
    }

    // Additive: include agent metrics in debug mode
    if (process.env.AI_DEBUG === "true") {
      response.agentMetrics = context.getAgentMetrics();
    }

    return response;
  }

  /**
   * Build analyze mode response.
   * Must match the shape from ai.service.js normalizeAiResult path.
   * @private
   */
  _buildAnalyzeResponse(context) {
    const intent = context.intent || {};
    const vizPlan = context.vizPlan || {};
    const computedData = context.computedData || [];
    const insights = context.insights || {};
    const domainReports = context.domainReports || {};

    const bulletPoints = Array.isArray(insights.bulletPoints)
      ? insights.bulletPoints
      : [];

    const response = {
      intent,
      chartType: vizPlan.chartType || intent.chartType || "bar",
      chartData: Array.isArray(computedData) ? computedData : [],
      insights: bulletPoints.length ? bulletPoints.join("\n") : "No insights available",
      insightBullets: bulletPoints,
      datasetSummary: context.get("datasetSummary") || null,
      vizPlan,
      computedData,
      processingTimeMs: context.totalProcessingMs,
      datasetIntelligence: context.intelligence || null,
    };

    // Add domain-specific reports if available
    if (domainReports.consumptionReport) {
      response.consumptionReport = domainReports.consumptionReport;
    }
    if (domainReports.recommendationReport) {
      response.recommendationReport = domainReports.recommendationReport;
    }

    // Additive: include narrative if available
    if (context.narrative) {
      response.narrative = context.narrative;
    }

    // Additive: include agent metrics in debug mode
    if (process.env.AI_DEBUG === "true") {
      response.agentMetrics = context.getAgentMetrics();
    }

    return response;
  }
}

module.exports = AgentOrchestrator;
