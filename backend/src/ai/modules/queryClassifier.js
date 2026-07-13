/**
 * Query Classifier Module
 * 
 * Classifies user queries into categories:
 * - "dashboard" (vague, auto-generate multiple views)
 * - "specific" (explicit, single-intent analysis)
 * 
 * Also provides query normalization for similar queries mapping to same intent.
 */

const VAGUE_QUERY_PATTERNS = [
  /\b(analyze|explore|show|display|view|check|understand|summarize)\s+(my\s+)?(data|dataset|information)/i,
  /\b(generate|create|build|make)\s+(a\s+)?(dashboard|report|overview|summary|analysis|breakdown)/i,
  /\b(what|tell|show|give)\s+(?:me\s+)?(a\s+)?(business\s+)?(summary|overview|analysis|insights|report|dashboard|breakdown)/i,
  /\b(analyze|profile|understand|explore)\s+(this\s+)?(dataset|data|information)/i,
  /\b(auto.*dashboard|auto.*report|automatic.*analysis|auto-generate)/i,
  /\b(full|complete|entire|all)\s+(analysis|report|dashboard|view|insights)/i,
  /\b(overall|general|business|complete)\s+(summary|overview|health|status|analysis|breakdown)/i,
  /^(show|display|view|check|explore|analyze)\s+(my\s+)?(data|dataset)/i,
  /\b(dashboard|report|overview|breakdown|summary)\s+(please)?$/i,
];

const SPECIFIC_QUERY_PATTERNS = [
  /\b(top|bottom|highest|lowest|rank|best|worst)\b/i,
  /\b(compare|vs|versus|relationship|correlation)\b/i,
  /\b(trend|over time|monthly|daily|yearly|growth)\b/i,
  /\b(distribution|histogram|spread)\b/i,
  /\b(by|group by)\s+\w+/i,
  /\b(sum|total|average|count|min|max)\b/i,
];

const INTENT_CATEGORY_KEYWORDS = {
  "trend": ["trend", "over time", "monthly", "daily", "yearly", "growth", "change", "progression"],
  "comparison": ["compare", "vs", "versus", "between", "difference", "by", "across", "each"],
  "distribution": ["distribution", "spread", "histogram", "frequency", "range", "spread out"],
  "correlation": ["correlation", "relationship", "relate", "affect", "impact", "depend"],
  "top_n": ["top", "bottom", "highest", "lowest", "rank", "best", "worst"],
  "outlier": ["outlier", "anomaly", "unusual", "extreme", "exception"],
  "summary": ["summary", "overview", "total", "count", "statistics", "describe"],
};

/**
 * Classify a query as vague (dashboard mode) or specific
 * @param {string} query - The user query
 * @param {number} vagueThreshold - Confidence threshold to consider vague (0-1)
 * @returns {Object} Classification with mode, confidence, category, isAutoDashboard
 */
function classifyQuery(query, vagueThreshold = 0.5) {
  if (!query || typeof query !== "string") {
    return {
      mode: "specific",
      confidence: 0.5,
      category: "summary",
      isAutoDashboard: false,
      reason: "Empty or invalid query",
    };
  }

  const q = String(query).trim().toLowerCase();
  
  // Check for explicit vague patterns (higher priority)
  const vagueMatches = VAGUE_QUERY_PATTERNS.filter(pattern => pattern.test(q)).length;
  const vagueScore = vagueMatches > 0 ? Math.min(1, 0.4 + vagueMatches * 0.3) : 0;

  // Check for explicit specific patterns
  const specificMatches = SPECIFIC_QUERY_PATTERNS.filter(pattern => pattern.test(q)).length;
  const specificScore = specificMatches > 0 ? Math.min(1, specificMatches * 0.2) : 0;

  // Determine mode based on combined signals
  // Vague pattern match takes priority
  const isVague = vagueMatches > 0 || (vagueScore > specificScore && vagueScore >= vagueThreshold);
  const mode = isVague ? "dashboard" : "specific";
  const confidence = isVague ? vagueScore : Math.min(1, 0.5 + specificScore);

  // Detect intent category
  const category = detectIntentCategory(q);

  return {
    mode,
    confidence: Number(confidence.toFixed(2)),
    category,
    isAutoDashboard: mode === "dashboard",
    reason: isVague ? "Vague/exploratory query detected" : "Specific query detected",
    vagueScore: Number(vagueScore.toFixed(2)),
    specificScore: Number(specificScore.toFixed(2)),
  };
}

/**
 * Detect the primary intent category from query
 * @param {string} query - The normalized query (lowercase)
 * @returns {string} Intent category
 */
function detectIntentCategory(query) {
  const scores = {};
  
  for (const [category, keywords] of Object.entries(INTENT_CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(kw => query.includes(kw)).length;
    scores[category] = matches;
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return "summary"; // default

  return Object.keys(scores).find(cat => scores[cat] === maxScore);
}

/**
 * Normalize query to canonical form for clustering
 * Helps identify similar queries that should map to same intent
 * @param {string} query - The user query
 * @returns {string} Normalized query
 */
function normalizeQuery(query) {
  if (!query || typeof query !== "string") return "";

  let normalized = query
    .trim()
    .toLowerCase()
    // Remove punctuation
    .replace(/[?!.,;:'"]/g, "")
    // Remove common filler words and actions
    .replace(/\b(please|could you|can you|would you|show me|show|display|give me|tell me|analyze|check|view|explore)\b/gi, "")
    // Remove articles
    .replace(/\b(a|an|the)\b/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

/**
 * Generate dashboard intents from dataset intelligence suggestions
 * Used for vague queries to auto-create multiple visualizations
 * @param {Object} intelligence - Dataset intelligence object
 * @param {Object} analysis - Dataset analysis object
 * @returns {Array} Array of suggested intents
 */
function generateDashboardIntents(intelligence, analysis) {
  if (!intelligence || !intelligence.suggestions) {
    return [];
  }

  const suggestions = intelligence.suggestions || {};
  const bestCharts = suggestions.bestChartTypes || [];
  const domain = intelligence.dataset?.domain || "Generic";

  const intents = [];

  // Generate intent for each suggested chart
  bestCharts.slice(0, 3).forEach((chart) => {
    intents.push({
      analysisType: inferAnalysisTypeFromChart(chart.type),
      chartType: chart.type,
      xAxis: chart.xAxis || null,
      yAxis: chart.yAxis || null,
      targetColumns: [chart.xAxis, chart.yAxis].filter(Boolean),
      groupBy: chart.xAxis || null,
      confidence: 0.75,
      source: "dashboard_suggestion",
      reason: chart.reason,
    });
  });

  // Add domain-specific metric if available
  const businessMetrics = suggestions.businessMetrics || [];
  if (businessMetrics.length > 0 && !intents.find(i => i.source === "domain_metric")) {
    const metric = businessMetrics[0];
    // Extract likely columns from formula
    const colMatch = metric.formula.match(/\w+/g);
    if (colMatch && colMatch.length > 0) {
      intents.push({
        analysisType: "comparison",
        chartType: "bar",
        targetColumns: colMatch,
        xAxis: colMatch[0],
        yAxis: colMatch[colMatch.length - 1],
        confidence: 0.65,
        source: "domain_metric",
        reason: metric.name,
      });
    }
  }

  return intents.slice(0, 4); // Return max 4 intents for dashboard
}

/**
 * Infer analysis type from chart type
 * @param {string} chartType - The chart type
 * @returns {string} Analysis type
 */
function inferAnalysisTypeFromChart(chartType) {
  const mapping = {
    "line": "trend",
    "area": "trend",
    "bar": "comparison",
    "pie": "distribution",
    "scatter": "correlation",
    "histogram": "distribution",
    "table": "summary",
  };
  return mapping[chartType] || "comparison";
}

/**
 * Map domain to relevant intent categories
 * Helps ensure domain-appropriate analysis suggestions
 * @param {string} domain - The detected domain
 * @returns {Array} Relevant intent categories for this domain
 */
function domainToIntentCategories(domain) {
  const domainMap = {
    "Sales": ["trend", "top_n", "comparison", "correlation"],
    "Finance": ["trend", "comparison", "correlation", "summary"],
    "Retail": ["top_n", "comparison", "trend", "distribution"],
    "Movies": ["distribution", "comparison", "summary"],
    "Healthcare": ["comparison", "correlation", "summary"],
    "HR": ["distribution", "comparison", "summary"],
    "Inventory": ["top_n", "comparison", "trend"],
    "Grocery": ["comparison", "distribution", "summary", "trend"],
    "Education": ["distribution", "comparison", "correlation"],
  };
  return domainMap[domain] || ["summary", "comparison", "trend"];
}

module.exports = {
  classifyQuery,
  detectIntentCategory,
  normalizeQuery,
  generateDashboardIntents,
  inferAnalysisTypeFromChart,
  domainToIntentCategories,
};
