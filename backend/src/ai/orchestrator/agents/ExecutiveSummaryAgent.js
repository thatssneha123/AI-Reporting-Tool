/**
 * ExecutiveSummaryAgent
 * Generates a professional, quantitative AI Executive Summary for every dashboard
 * by reusing outputs from DatasetAgent, DomainAgent, and InsightAgent.
 * Does NOT use static hardcoded text — dynamically composes text based on real metrics.
 */
class ExecutiveSummaryAgent {
  /**
   * Generate Executive Summary object
   * @param {Object} params - { datasetProfile, domainIntelligence, insights }
   * @returns {Object} Structured Executive Summary report
   */
  generate({ datasetProfile, domainIntelligence, insights }) {
    const domain = (datasetProfile?.domain || "Generic").trim();
    const domainLower = domain.toLowerCase();
    const datasetType = datasetProfile?.datasetType || `${domain} Dataset`;

    const rowCount = datasetProfile?.profile?.rowCount || 0;
    const colCount = datasetProfile?.profile?.columnCount || 0;
    const qualityScore = datasetProfile?.quality?.qualityScore ?? 100;

    let summaryText = "";
    const highlights = [];

    if (domainLower === "grocery" || domainLower === "expense") {
      const consumption = domainIntelligence?.consumptionReport || {};
      const recommendations = domainIntelligence?.recommendationReport || {};

      const totalItems = rowCount;
      const totalSpend = consumption.totalSpend || 0;
      const healthySpend = consumption.healthySpend || 0;
      const healthScore = consumption.healthScore || (totalSpend > 0 ? Math.round((healthySpend / totalSpend) * 100) : 0);
      const savings = consumption.estimatedSavings || recommendations.estimatedSavings || 0;

      summaryText = `This grocery bill contains ${totalItems} purchased item${totalItems === 1 ? "" : "s"} totaling ₹${totalSpend.toLocaleString()}. ${healthScore}% of spending is healthy. Replacing unhealthy products could save ₹${savings.toLocaleString()}.`;

      if (recommendations.recommendations?.length > 0) {
        highlights.push(...recommendations.recommendations.slice(0, 3));
      }
    } else if (domainLower === "sales" || domainLower === "orders") {
      summaryText = `This ${datasetType.toLowerCase()} contains ${rowCount.toLocaleString()} transactions across ${colCount} data dimensions with a data quality score of ${qualityScore}%.`;

      if (insights?.insightBullets?.length > 0) {
        highlights.push(...insights.insightBullets.slice(0, 3));
      } else if (Array.isArray(insights?.insights)) {
        highlights.push(...insights.insights.slice(0, 3));
      }
    } else if (domainLower === "movies" || domainLower === "media" || domainLower === "netflix") {
      summaryText = `This media catalog contains ${rowCount.toLocaleString()} titles categorized across ${colCount} attributes with a ${qualityScore}% quality index.`;

      if (insights?.insightBullets?.length > 0) {
        highlights.push(...insights.insightBullets.slice(0, 3));
      }
    } else {
      summaryText = `Analyzed ${datasetType.toLowerCase()} containing ${rowCount.toLocaleString()} records across ${colCount} attributes with an overall data quality score of ${qualityScore}%.`;

      if (insights?.insightBullets?.length > 0) {
        highlights.push(...insights.insightBullets.slice(0, 3));
      }
    }

    return {
      title: "Executive Summary",
      text: summaryText,
      highlights,
      metadata: {
        rowCount,
        colCount,
        qualityScore,
        domain,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = new ExecutiveSummaryAgent();
