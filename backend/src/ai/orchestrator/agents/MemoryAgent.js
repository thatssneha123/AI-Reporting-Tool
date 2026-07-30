/**
 * MemoryAgent
 * Session-based in-memory storage and retrieval agent.
 * Remembers current dataset type, dataset profile, previous questions,
 * previous insights, and dashboard summaries per session without using a database.
 * Enables follow-up queries (e.g., "What was the health score?", "What was the total spend?", "Compare with previous result").
 */
class MemoryAgent {
  constructor() {
    /** @type {Map<string, Object>} In-memory session store (keyed by session ID / file path) */
    this.sessions = new Map();
  }

  /**
   * Get or initialize session state for a given key
   * @param {string} sessionKey 
   * @returns {Object} Session data object
   */
  getSession(sessionKey = "default") {
    const key = String(sessionKey || "default").trim();
    if (!this.sessions.has(key)) {
      this.sessions.set(key, {
        datasetType: "Generic Dataset",
        profile: null,
        domainIntelligence: null,
        insights: null,
        executiveSummary: null,
        dashboardSummary: null,
        healthScore: null,
        totalSpend: null,
        previousQuestions: [],
        previousResults: [],
        updatedAt: new Date().toISOString(),
      });
    }
    return this.sessions.get(key);
  }

  /**
   * Save or update session memory state
   * @param {string} sessionKey 
   * @param {Object} data 
   */
  saveSession(sessionKey = "default", data = {}) {
    const session = this.getSession(sessionKey);

    if (data.datasetType) session.datasetType = data.datasetType;
    if (data.profile) session.profile = data.profile;
    if (data.domainIntelligence) {
      session.domainIntelligence = data.domainIntelligence;
      const metrics = data.domainIntelligence.metrics || data.domainIntelligence.consumptionReport || {};
      if (metrics.healthScore !== undefined) session.healthScore = metrics.healthScore;
      if (metrics.totalSpend !== undefined) session.totalSpend = metrics.totalSpend;
    }
    if (data.consumptionReport) {
      if (data.consumptionReport.healthScore !== undefined) session.healthScore = data.consumptionReport.healthScore;
      if (data.consumptionReport.totalSpend !== undefined) session.totalSpend = data.consumptionReport.totalSpend;
    }
    if (data.insights) session.insights = data.insights;
    if (data.executiveSummary) session.executiveSummary = data.executiveSummary;
    if (data.dashboard) session.dashboardSummary = data.dashboard.summary || null;

    session.updatedAt = new Date().toISOString();
    return session;
  }

  /**
   * Record a asked question and answer in session history
   * @param {string} sessionKey 
   * @param {string} question 
   * @param {Object} result 
   */
  recordQuestion(sessionKey = "default", question = "", result = null) {
    const session = this.getSession(sessionKey);
    if (question && question.trim()) {
      session.previousQuestions.push({
        question: question.trim(),
        timestamp: new Date().toISOString(),
      });
      if (result) {
        session.previousResults.push({
          question: question.trim(),
          chartType: result.chartType || "bar",
          summary: result.insights || result.datasetSummary || null,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Determine if a query is a follow-up question referencing session memory
   * @param {string} query 
   * @returns {boolean}
   */
  isFollowUpQuery(query = "") {
    if (!query || typeof query !== "string") return false;
    const lower = query.toLowerCase().trim();

    const patterns = [
      /health\s*score/i,
      /total\s*spend/i,
      /compare\s*with\s*previous/i,
      /previous\s*result/i,
      /previous\s*question/i,
      /previous\s*insight/i,
      /what\s*was\s*the/i,
      /dataset\s*profile/i,
      /dataset\s*type/i,
    ];

    return patterns.some((p) => p.test(lower));
  }

  /**
   * Resolve follow-up query using stored session memory
   * @param {string} query 
   * @param {string} sessionKey 
   * @returns {Object|null} Formatted response object or null if memory not found
   */
  resolveFollowUp(query = "", sessionKey = "default") {
    const session = this.getSession(sessionKey);
    const lower = query.toLowerCase().trim();

    // 1. Health Score follow-up
    if (lower.includes("health score")) {
      const score = session.healthScore !== null ? session.healthScore : "N/A";
      const text = session.healthScore !== null
        ? `The health score for the current ${session.datasetType} is ${score}/100.`
        : `Health score is not available for this ${session.datasetType}.`;

      return this._buildMemoryResult(query, "Health Score Query", text, [text], session);
    }

    // 2. Total Spend follow-up
    if (lower.includes("total spend") || lower.includes("total spending")) {
      const spend = session.totalSpend !== null ? `₹${session.totalSpend.toLocaleString()}` : "N/A";
      const text = session.totalSpend !== null
        ? `The total spend for the current dataset is ${spend}.`
        : `Total spend metric is not available for this ${session.datasetType}.`;

      return this._buildMemoryResult(query, "Total Spend Query", text, [text], session);
    }

    // 3. Compare with previous result / previous insights follow-up
    if (lower.includes("compare") || lower.includes("previous result") || lower.includes("previous insight")) {
      const prevCount = session.previousQuestions.length;
      const lastQ = prevCount > 0 ? session.previousQuestions[prevCount - 1].question : "None";
      const execText = session.executiveSummary?.text || "No executive summary available.";
      
      const bullets = [
        `Session Dataset: ${session.datasetType}`,
        `Previous queries asked: ${prevCount} (Last query: "${lastQ}")`,
        `Current Executive Summary: ${execText}`,
      ];

      if (session.healthScore !== null) bullets.push(`Health Score: ${session.healthScore}/100`);
      if (session.totalSpend !== null) bullets.push(`Total Spend: ₹${session.totalSpend.toLocaleString()}`);

      const text = `Session Memory Summary:\n${bullets.join("\n")}`;
      return this._buildMemoryResult(query, "Session Memory Comparison", text, bullets, session);
    }

    // 4. Dataset type / profile follow-up
    if (lower.includes("dataset type") || lower.includes("dataset profile")) {
      const rowCount = session.profile?.rowCount || "N/A";
      const colCount = session.profile?.columnCount || "N/A";
      const text = `Current dataset type is "${session.datasetType}" containing ${rowCount} rows and ${colCount} columns.`;

      return this._buildMemoryResult(query, "Dataset Profile Query", text, [text], session);
    }

    return null;
  }

  /**
   * Helper to construct response payload compatible with single-chart Analyze result
   * @private
   */
  _buildMemoryResult(rawQuery, title, insightsText, bullets, session) {
    return {
      intent: {
        rawUserInput: rawQuery,
        analysisType: "memory_recall",
        chartType: "table",
        confidence: 1.0,
      },
      chartType: "table",
      chartData: (session.previousQuestions || []).map((q, idx) => ({
        step: idx + 1,
        question: q.question,
        timestamp: q.timestamp,
      })),
      insights: insightsText,
      insightBullets: bullets,
      datasetSummary: {
        shape: `${session.profile?.rowCount || 0} rows × ${session.profile?.columnCount || 0} columns`,
        qualityScore: session.profile?.quality?.qualityScore || 100,
      },
      vizPlan: {
        chartType: "table",
        title,
      },
      computedData: (session.previousQuestions || []).map((q, idx) => ({
        step: idx + 1,
        question: q.question,
        timestamp: q.timestamp,
      })),
      processingTimeMs: 5,
    };
  }

  /**
   * Clear all stored session memory (useful for testing)
   */
  clear() {
    this.sessions.clear();
  }
}

module.exports = new MemoryAgent();
