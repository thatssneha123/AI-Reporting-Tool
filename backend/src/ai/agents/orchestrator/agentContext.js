/**
 * AgentContext - Shared state bus for the agent pipeline
 * 
 * Each request creates one AgentContext instance.
 * Agents read from and write to it — this is how data flows between agents
 * without agents knowing about each other.
 * 
 * The context is a typed key-value store with:
 *   - get/set/has for safe access
 *   - Timing tracking per agent
 *   - Error collection
 *   - Request metadata
 */

class AgentContext {
  /**
   * @param {Object} request - Original request parameters
   * @param {string} request.filePath - Absolute path to dataset file
   * @param {string} request.query - User's query string (may be empty for dashboard mode)
   * @param {string} [request.datasetId] - MongoDB dataset ID (if available)
   */
  constructor(request = {}) {
    this._store = new Map();
    this._timing = {};
    this._errors = [];
    this._agentsRun = [];

    // Store original request
    this._store.set("request", {
      filePath: request.filePath || null,
      query: request.query ?? "",
      datasetId: request.datasetId || null,
    });
  }

  // ─── Core Store Operations ──────────────────────────────────

  /**
   * Get a value from the context store
   * @param {string} key
   * @returns {*} The stored value, or undefined
   */
  get(key) {
    return this._store.get(key);
  }

  /**
   * Set a value in the context store
   * @param {string} key
   * @param {*} value
   * @returns {AgentContext} this (for chaining)
   */
  set(key, value) {
    this._store.set(key, value);
    return this;
  }

  /**
   * Check if a key exists and has a non-null/undefined value
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    if (!this._store.has(key)) return false;
    const val = this._store.get(key);
    return val !== null && val !== undefined;
  }

  // ─── Convenience Getters ────────────────────────────────────

  /** @returns {{ filePath: string, query: string, datasetId: string }} */
  get request() {
    return this._store.get("request");
  }

  /** @returns {string} The user's query */
  get query() {
    return this.request?.query ?? "";
  }

  /** @returns {boolean} True if query is empty (dashboard mode) */
  get isDashboardMode() {
    return !this.query.trim();
  }

  /** @returns {Array} Raw dataset rows */
  get dataset() {
    return this._store.get("dataset") || [];
  }

  /** @returns {Object|null} Dataset intelligence object */
  get intelligence() {
    return this._store.get("intelligence") || null;
  }

  /** @returns {Object|null} Dataset analysis object */
  get analysis() {
    return this._store.get("analysis") || null;
  }

  /** @returns {Object|null} Parsed intent */
  get intent() {
    return this._store.get("intent") || null;
  }

  /** @returns {Object|null} Query classification */
  get queryClassification() {
    return this._store.get("queryClassification") || null;
  }

  /** @returns {Array} Computed data for charts */
  get computedData() {
    return this._store.get("computedData") || [];
  }

  /** @returns {Object|null} Visualization plan */
  get vizPlan() {
    return this._store.get("vizPlan") || null;
  }

  /** @returns {Object|null} Insights object */
  get insights() {
    return this._store.get("insights") || null;
  }

  /** @returns {Object|null} Dashboard object (dashboard mode only) */
  get dashboard() {
    return this._store.get("dashboard") || null;
  }

  /** @returns {Object} Domain-specific reports */
  get domainReports() {
    return this._store.get("domainReports") || {};
  }

  /** @returns {Object|null} Narrative / executive summary */
  get narrative() {
    return this._store.get("narrative") || null;
  }

  // ─── Timing ─────────────────────────────────────────────────

  /**
   * Record timing for an agent
   * @param {string} agentName
   * @param {number} durationMs
   */
  recordTiming(agentName, durationMs) {
    this._timing[agentName] = durationMs;
    this._agentsRun.push(agentName);
  }

  /** @returns {Object} Timing map { agentName: durationMs } */
  get timing() {
    return { ...this._timing };
  }

  /** @returns {string[]} Ordered list of agents that have run */
  get agentsRun() {
    return [...this._agentsRun];
  }

  /** @returns {number} Total processing time across all agents */
  get totalProcessingMs() {
    return Object.values(this._timing).reduce((sum, ms) => sum + ms, 0);
  }

  // ─── Error Collection ───────────────────────────────────────

  /**
   * Record a non-fatal error from an agent
   * @param {string} agentName
   * @param {Error|string} error
   */
  addError(agentName, error) {
    this._errors.push({
      agent: agentName,
      message: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
    });
  }

  /** @returns {Array} All collected errors */
  get errors() {
    return [...this._errors];
  }

  /** @returns {boolean} True if any errors were recorded */
  get hasErrors() {
    return this._errors.length > 0;
  }

  // ─── Serialization ─────────────────────────────────────────

  /**
   * Export agent metrics (timing, errors, agents run) for debug/response
   * @returns {Object}
   */
  getAgentMetrics() {
    return {
      agentsRun: this.agentsRun,
      timing: this.timing,
      totalProcessingMs: this.totalProcessingMs,
      errors: this.errors,
    };
  }
}

module.exports = AgentContext;
