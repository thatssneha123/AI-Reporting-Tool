/**
 * InsightAgent
 * Generates intelligent, data-driven observations (top categories, health scores,
 * spending trends, outliers, correlations, and data quality scores)
 * by reusing outputs from DatasetAgent and DomainAgent.
 */
class InsightAgent {
  /**
   * Generate intelligent business observations
   * @param {Object} params - { datasetProfile, domainIntelligence }
   * @returns {Object} Structured Insights object
   */
  generate({ datasetProfile, domainIntelligence }) {
    const observations = [];

    const profile = datasetProfile?.profile || {};
    const quality = datasetProfile?.quality || {};
    const statistics = datasetProfile?.statistics || {};

    // 1. Highest Spending / Top Category Observation
    if (domainIntelligence?.consumptionReport?.topCategories?.length > 0) {
      const topCat = domainIntelligence.consumptionReport.topCategories[0];
      const totalSpend = domainIntelligence.consumptionReport.totalSpend || 1;
      const pct = Math.round((topCat.spend / totalSpend) * 100);
      observations.push(
        `Top spending category is ${topCat.category} at ₹${topCat.spend.toLocaleString()} (${pct}% of total spend).`
      );
    } else if (statistics.distribution && Object.keys(statistics.distribution).length > 0) {
      const firstCatCol = Object.keys(statistics.distribution)[0];
      const valueCounts = statistics.distribution[firstCatCol] || [];
      if (valueCounts.length > 0) {
        const topVal = valueCounts[0];
        const totalRows = profile.rowCount || 1;
        const pct = Math.round((topVal.count / totalRows) * 100);
        observations.push(
          `Dominant ${firstCatCol} is "${topVal.name}" representing ${topVal.count} records (${pct}% of total).`
        );
      }
    }

    // 2. Health Score & Spending Interpretation (Grocery/Expense)
    if (domainIntelligence?.consumptionReport) {
      const consumption = domainIntelligence.consumptionReport;
      const score = consumption.healthScore ?? 0;
      let interpretation = "balanced choices";
      if (score < 40) interpretation = "high proportion of processed/unhealthy items";
      else if (score < 70) interpretation = "moderate processed item consumption";
      else interpretation = "excellent health balance";

      const savingsMsg = consumption.estimatedSavings > 0
        ? ` Potential estimated savings of ₹${consumption.estimatedSavings.toLocaleString()} by substituting processed products.`
        : "";

      observations.push(
        `Health score is ${score}/100 (${interpretation}).${savingsMsg}`
      );
    }

    // 3. Spending Trends / Statistical Summary
    if (statistics.basic && Object.keys(statistics.basic).length > 0) {
      const firstNumCol = Object.keys(statistics.basic)[0];
      const stats = statistics.basic[firstNumCol];
      if (stats && stats.count > 0) {
        observations.push(
          `Average ${firstNumCol} across ${stats.count} records is ${formatNumber(stats.mean)} (min: ${formatNumber(stats.min)}, max: ${formatNumber(stats.max)}, sum: ${formatNumber(stats.sum)}).`
        );
      }
    }

    // 4. Outlier Detection Observations
    if (statistics.outliers && Object.keys(statistics.outliers).length > 0) {
      const outlierCols = Object.keys(statistics.outliers);
      const totalOutliers = outlierCols.reduce((acc, col) => acc + (statistics.outliers[col]?.length || 0), 0);
      const firstCol = outlierCols[0];
      const sampleOutlier = statistics.outliers[firstCol]?.[0];

      if (totalOutliers > 0 && sampleOutlier) {
        observations.push(
          `Detected ${totalOutliers} outlier(s) in ${firstCol} exceeding 2.5 standard deviations (e.g. value: ${formatNumber(sampleOutlier.value)}, z-score: ${sampleOutlier.zScore}).`
        );
      }
    }

    // 5. Correlation Observations
    if (statistics.correlations && Object.keys(statistics.correlations).length > 0) {
      const pairs = Object.entries(statistics.correlations);
      const sorted = pairs.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      const [pairName, rValue] = sorted[0];
      const formattedPair = pairName.replace("_vs_", " and ");
      const strength = Math.abs(rValue) > 0.7 ? "Strong" : Math.abs(rValue) > 0.4 ? "Moderate" : "Weak";

      observations.push(
        `${strength} correlation detected between ${formattedPair} (r = ${rValue.toFixed(2)}).`
      );
    }

    // 6. Data Quality & Missing Value Observations
    const qualityScore = quality.qualityScore ?? 100;
    const missingTotal = quality.missingValues?.totalMissing || 0;
    if (missingTotal === 0) {
      observations.push(`Data quality score is ${qualityScore}% with zero missing values detected.`);
    } else {
      observations.push(`Data quality score is ${qualityScore}% with ${missingTotal} missing value(s) identified.`);
    }

    return {
      type: "insights",
      title: "Business Insights",
      insights: observations,
      bulletPoints: observations,
    };
  }
}

function formatNumber(val) {
  if (val == null || isNaN(val)) return "0";
  return Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

module.exports = new InsightAgent();
