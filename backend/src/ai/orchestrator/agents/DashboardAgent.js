const { generateDashboard } = require("../../modules/dashboardGenerator");
const { computeAllChartData } = require("../../modules/dashboardDataCompute");

/**
 * DashboardAgent
 * Assembles the complete structured dashboard object using outputs from DatasetAgent and DomainAgent.
 * Reuses existing dashboardGenerator and dashboardDataCompute modules without duplicating any logic.
 */
class DashboardAgent {
  /**
   * Assemble complete dashboard object from agent outputs
   * @param {Object} params - { datasetProfile, domainIntelligence, insights }
   * @returns {Promise<Object>} Complete structured dashboard JSON object
   */
  async assemble({ datasetProfile, domainIntelligence, insights, executiveSummary }) {
    const dataset = datasetProfile?.dataset || [];
    const intelligence = datasetProfile?.intelligence || {};
    const analysis = datasetProfile?.analysis || {};
    const profile = datasetProfile?.profile || {};
    const quality = datasetProfile?.quality || {};

    if (!intelligence || !analysis) {
      return {
        dashboardMode: false,
        error: "Missing intelligence or analysis data",
      };
    }

    // 1. Reuse existing Dashboard Generator for layout, KPI cards, and chart intents
    const dashboard = generateDashboard(intelligence, analysis, dataset);

    // 2. Reuse existing Dashboard Data Compute for calculating actual chart data
    const chartsWithData = computeAllChartData(dataset, dashboard.charts || [], intelligence);

    // 3. Use Executive Summary from ExecutiveSummaryAgent or fallback
    const summaryCard = executiveSummary || buildExecutiveSummary({
      domain: datasetProfile?.domain || intelligence.dataset?.domain || "Generic",
      datasetType: datasetProfile?.datasetType || intelligence.dataset?.inferredType || "Dataset",
      profile,
      quality,
      domainIntelligence,
    });

    // 4. Extract AI Insights & Suggestions
    const formattedInsights = insights || dashboard.insights || {
      type: "insights",
      title: "Business Insights",
      insights: [],
    };

    // 5. Build combined structured Dashboard JSON object
    const completeDashboard = {
      ...dashboard,
      charts: chartsWithData,
      executiveSummary: summaryCard,
      insights: formattedInsights,
      domainIntelligence: domainIntelligence || null,
      datasetIntelligence: intelligence,
    };

    // 6. Include Domain Reports for Grocery / Expense datasets
    if (domainIntelligence?.consumptionReport) {
      completeDashboard.consumptionReport = domainIntelligence.consumptionReport;
    }
    if (domainIntelligence?.recommendationReport) {
      completeDashboard.recommendationReport = domainIntelligence.recommendationReport;
    }

    return completeDashboard;
  }

  /**
   * Backward-compatible helper method signature
   */
  async generate({ dataset, intelligence, analysis, datasetProfile, domainIntelligence, insights }) {
    if (datasetProfile && domainIntelligence) {
      return this.assemble({ datasetProfile, domainIntelligence, insights });
    }

    const dashboard = generateDashboard(intelligence, analysis, dataset);
    const chartsWithData = computeAllChartData(dataset, dashboard.charts || [], intelligence);

    return {
      ...dashboard,
      charts: chartsWithData,
    };
  }
}

/**
 * Helper: Build Executive Summary narrative and metrics
 */
function buildExecutiveSummary({ domain, datasetType, profile, quality, domainIntelligence }) {
  const rowCount = profile.rowCount || 0;
  const colCount = profile.columnCount || 0;
  const qualityScore = quality.qualityScore ?? 100;
  const domainLower = String(domain).toLowerCase();

  let text = `Analyzed ${datasetType} containing ${rowCount.toLocaleString()} records across ${colCount} attributes with a ${qualityScore}% data quality score.`;

  if (domainLower === "grocery" || domainLower === "expense") {
    const healthScore = domainIntelligence?.metrics?.healthScore ?? 0;
    const savings = domainIntelligence?.metrics?.estimatedSavings ?? 0;
    text += ` Grocery analysis shows a Health Score of ${healthScore}/100 with an estimated savings potential of ₹${savings.toLocaleString()} by reducing non-essential expenditure.`;
  } else if (domainLower === "sales" || domainLower === "orders") {
    text += ` Revenue performance and category trends have been generated across key operational dimensions.`;
  } else if (domainLower === "movies" || domainLower === "media") {
    text += ` Title catalog distribution evaluated by content formats, release years, and genre categories.`;
  }

  return {
    title: "Executive Summary",
    text,
    metrics: {
      totalRecords: rowCount,
      totalColumns: colCount,
      dataQualityScore: qualityScore,
      domain,
    },
  };
}

module.exports = new DashboardAgent();
