/**
 * Dashboard Generator Module
 * 
 * Generates multiple chart intents and a complete dashboard from dataset intelligence.
 * Works for any dataset type (Sales, Movies, Finance, Grocery, HR, etc.)
 */

const { generateDashboardIntents, domainToIntentCategories } = require("./queryClassifier");
const { computeKpiValues, generateSmartKpis } = require("./dashboardKpiCompute");
const { computeDomainSpecificCharts } = require("./dashboardDataCompute");

/**
 * Generate a complete dashboard from dataset intelligence
 * @param {Object} intelligence - Dataset intelligence object
 * @param {Object} analysis - Dataset analysis object
 * @param {Array} rawDataset - Raw dataset for computing actual KPI values
 * @returns {Object} Dashboard configuration with multiple intents
 */
function generateDashboard(intelligence, analysis, rawDataset = []) {
  if (!intelligence || !analysis) {
    return {
      dashboardMode: false,
      error: "Missing intelligence or analysis data",
    };
  }

  const domain = intelligence.dataset?.domain || "Generic Business";
  const datasetType = intelligence.dataset?.inferredType || "Dataset";
  const schema = intelligence.schema || {};
  const quality = intelligence.quality || {};
  const suggestions = intelligence.suggestions || {};

  // 1. Generate suggested chart intents from intelligence suggestions
  const genericIntents = generateDashboardIntents(intelligence, analysis);

  // 1b. Generate domain-specific chart intents (Titanic, Netflix, Retail, etc.)
  const domainCharts = computeDomainSpecificCharts(rawDataset, domain, intelligence);

  // 1c. Merge: domain-specific charts first, then fill with generic, dedup by axis pair
  const seen = new Set();
  const chartIntents = [];
  for (const chart of [...domainCharts, ...genericIntents]) {
    const key = `${chart.xAxis}__${chart.yAxis}__${chart.chartType}`;
    if (!seen.has(key)) {
      seen.add(key);
      chartIntents.push(chart);
    }
  }

  // 2. Create dataset summary card
  const datasetSummary = {
    type: "summary",
    title: "Dataset Overview",
    metrics: {
      totalRecords: schema.totalRows || 0,
      totalColumns: schema.totalColumns || 0,
      datasetType,
      domain,
      dataQualityScore: quality.dataQualityScore || 0,
    },
  };

  // 3. Create quality metrics card
  const qualityMetrics = {
    type: "quality",
    title: "Data Quality",
    metrics: {
      dataQualityScore: quality.dataQualityScore || 0,
      missingValuesTotal: quality.missingValues?.totalMissing || 0,
      duplicateRows: quality.duplicateRows || 0,
      topMissingColumns: buildMissingColumnsInfo(quality.missingValues),
    },
  };

  // 4. Create KPI cards with computed values
  let kpiCards = {
    type: "kpis",
    title: "Key Performance Indicators",
    cards: [],
  };

  // If we have raw dataset, compute actual KPI values
  if (rawDataset && rawDataset.length > 0) {
    try {
      const smartKpis = generateSmartKpis(rawDataset, domain, schema);
      const computedKpis = computeKpiValues(rawDataset, smartKpis, schema);
      kpiCards.cards = computedKpis.slice(0, 8);
    } catch (error) {
      console.error("Error computing KPI values:", error.message);
      // Fallback to suggestions
      kpiCards.cards = (suggestions.kpiCards || []).slice(0, 8);
    }
  } else {
    // Fallback to suggestions if no raw dataset provided
    kpiCards.cards = (suggestions.kpiCards || []).slice(0, 8);
  }

  // 5. Create insights placeholder
  const insightsCard = {
    type: "insights",
    title: "Business Insights",
    insights: buildInsights(domain, schema, quality),
  };

  // 6. Create recommendations card
  const recommendationsCard = {
    type: "recommendations",
    title: "Recommendations",
    recommendations: buildRecommendations(domain, schema, quality),
  };

  // 7. Create next questions card
  const nextQuestionsCard = {
    type: "questions",
    title: "Suggested Next Questions",
    questions: buildNextQuestions(domain, schema),
  };

  return {
    dashboardMode: true,
    domain,
    datasetType,
    charts: chartIntents.slice(0, 8), // Max 8 charts
    summary: datasetSummary,
    quality: qualityMetrics,
    kpis: kpiCards,
    insights: insightsCard,
    recommendations: recommendationsCard,
    questions: nextQuestionsCard,
  };
}

/**
 * Build missing columns information
 * @param {Object} missingValues - Missing values stats
 * @returns {Array} Top missing columns
 */
function buildMissingColumnsInfo(missingValues) {
  if (!missingValues || !missingValues.byColumn) return [];
  
  return Object.entries(missingValues.byColumn)
    .map(([col, stats]) => ({
      column: col,
      missingCount: stats.missing,
      missingPercent: parseFloat(stats.missingPercent || 0),
    }))
    .filter(item => item.missingPercent > 0)
    .sort((a, b) => b.missingPercent - a.missingPercent)
    .slice(0, 3);
}

/**
 * Build domain-specific business insights
 * @param {string} domain - Dataset domain
 * @param {Object} schema - Schema information
 * @param {Object} quality - Quality metrics
 * @returns {Array} Insight strings
 */
function buildInsights(domain, schema, quality) {
  const insights = [];

  // Quality insights
  const score = quality.dataQualityScore || 0;
  if (score >= 80) {
    insights.push("✓ Data quality is excellent. Ready for analysis.");
  } else if (score >= 60) {
    insights.push("⚠ Data quality is moderate. Some cleaning recommended.");
  } else {
    insights.push("⚠ Data quality needs improvement. Consider data cleansing.");
  }

  // Completeness insight
  const totalMissing = quality.missingValues?.totalMissing || 0;
  const totalCells = (schema.totalRows || 0) * (schema.totalColumns || 0);
  if (totalCells > 0) {
    const missingPct = (totalMissing / totalCells) * 100;
    if (missingPct > 20) {
      insights.push(`${missingPct.toFixed(1)}% of data is missing. Fill gaps before analysis.`);
    }
  }

  // Domain-specific insights
  const hasCurrency = (schema.currencyColumns || []).length > 0;
  const hasDate = (schema.dateColumns || []).length > 0;
  const hasCategories = (schema.categoricalColumns || []).length > 0;

  if (domain === "Sales" && hasCurrency && hasDate) {
    insights.push("Time-series analysis available for revenue trends.");
  } else if (domain === "Grocery" && hasCurrency) {
    insights.push("Spending patterns can be analyzed by category.");
  } else if (domain === "Movies" && hasCategories) {
    insights.push("Genre and release patterns ready for exploration.");
  }

  // Structural insights
  if ((schema.dateColumns || []).length > 1) {
    insights.push(`Multiple time dimensions detected. ${schema.dateColumns.length} date columns available.`);
  }

  return insights.slice(0, 5);
}

/**
 * Build domain-specific recommendations
 * @param {string} domain - Dataset domain
 * @param {Object} schema - Schema information
 * @param {Object} quality - Quality metrics
 * @returns {Array} Recommendation strings
 */
function buildRecommendations(domain, schema, quality) {
  const recommendations = [];

  // Quality recommendations
  if (quality.duplicateRows > 0) {
    recommendations.push(`Remove ${quality.duplicateRows} duplicate rows before analysis.`);
  }

  const missingCols = (schema.currencyColumns || []).filter(col => {
    const missing = quality.missingValues?.byColumn?.[col];
    return missing && parseFloat(missing.missingPercent) > 30;
  });
  if (missingCols.length > 0) {
    recommendations.push(`Fill or remove ${missingCols.length} columns with >30% missing values.`);
  }

  // Domain-specific recommendations
  switch (domain) {
    case "Sales":
      if ((schema.currencyColumns || []).length > 0) {
        recommendations.push("Create revenue growth trends and KPI dashboards.");
      }
      if ((schema.categoricalColumns || []).length > 0) {
        recommendations.push("Analyze performance by region, product, or sales rep.");
      }
      break;

    case "Grocery":
      if ((schema.currencyColumns || []).length > 0) {
        recommendations.push("Track spending by category and identify savings opportunities.");
      }
      recommendations.push("Monitor purchase frequency and seasonal patterns.");
      break;

    case "Movies":
      if ((schema.categoricalColumns || []).length > 0) {
        recommendations.push("Explore genre distribution and viewer preferences.");
      }
      recommendations.push("Analyze release trends and rating patterns.");
      break;

    case "Finance":
      if ((schema.dateColumns || []).length > 0) {
        recommendations.push("Monitor expense trends and budget adherence over time.");
      }
      recommendations.push("Create expense category breakdown for cost optimization.");
      break;

    case "HR":
      if ((schema.categoricalColumns || []).length > 0) {
        recommendations.push("Analyze headcount by department and role distribution.");
      }
      recommendations.push("Track attendance and performance metrics.");
      break;

    case "Inventory":
      recommendations.push("Monitor stock levels and reorder points.");
      recommendations.push("Analyze product movement and warehouse utilization.");
      break;

    default:
      recommendations.push("Start with data profiling and quality assessment.");
      recommendations.push("Identify key business metrics and KPIs.");
  }

  return recommendations.slice(0, 5);
}

/**
 * Build domain-specific suggested next questions
 * @param {string} domain - Dataset domain
 * @param {Object} schema - Schema information
 * @returns {Array} Question strings
 */
function buildNextQuestions(domain, schema) {
  const questions = [];
  const hasDate = (schema.dateColumns || []).length > 0;
  const hasCategory = (schema.categoricalColumns || []).length > 0;
  const hasNumeric = (schema.numericalColumns || []).length > 0;

  // General questions that work for any dataset
  if (hasNumeric) {
    questions.push("What are the min, max, and average values?");
  }

  if (hasCategory && hasNumeric) {
    questions.push(`What's the distribution across ${schema.categoricalColumns?.[0] || "categories"}?`);
  }

  if (hasDate && hasNumeric) {
    questions.push("How have values changed over time?");
  }

  // Domain-specific questions
  switch (domain) {
    case "Sales":
      questions.push("Which region has the highest revenue?");
      questions.push("What are the top 10 products by sales?");
      questions.push("How does monthly revenue compare year-over-year?");
      break;

    case "Grocery":
      questions.push("What's my spending by category?");
      questions.push("Where am I spending the most?");
      questions.push("What are my purchase patterns?");
      break;

    case "Movies":
      questions.push("What's the distribution of movies vs TV shows?");
      questions.push("Which genres are most common?");
      questions.push("How have release patterns changed over time?");
      break;

    case "Finance":
      questions.push("What are my top expense categories?");
      questions.push("How does spending trend month-over-month?");
      questions.push("What's my budget utilization by department?");
      break;

    case "HR":
      questions.push("What's the headcount by department?");
      questions.push("How's attendance across teams?");
      questions.push("What's the salary distribution?");
      break;

    case "Orders":
      questions.push("How many orders do I receive daily?");
      questions.push("What's the average order value?");
      questions.push("Which customers are my top buyers?");
      break;

    default:
      questions.push("What are the key trends in this data?");
      questions.push("Are there any anomalies or outliers?");
      questions.push("What's the data quality score?");
  }

  return questions.slice(0, 6);
}

/**
 * Check if a query should trigger dashboard mode
 * @param {string} query - User query
 * @returns {boolean} True if dashboard mode should be triggered
 */
function shouldTriggerDashboard(query) {
  const q = String(query || "").trim();

  // Dashboard mode only triggers when query is empty (Dashboard button sends "")
  // Analyze button always sends non-empty text, so it never triggers dashboard
  return !q;
}

module.exports = {
  generateDashboard,
  shouldTriggerDashboard,
  buildInsights,
  buildRecommendations,
  buildNextQuestions,
};
