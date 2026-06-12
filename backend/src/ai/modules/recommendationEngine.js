const { classifyProduct } = require("../utils/productClassifier");
const { getHealthScore } = require("../utils/healthScorer");

function generateRecommendations(dataset) {
  const report = {
    unhealthyItems: [],
    healthyItems: [],
    recommendations: [],
    swadeshiAlternatives: [],
    estimatedSavings: 0
  };

  for (const row of dataset) {
    const item =
      row.item ||
      row.product ||
      row.product_name ||
      "";

    const category = classifyProduct(item);

    const score = getHealthScore(category);

    if (score <= 3) {
      report.unhealthyItems.push({
        item,
        category,
        healthScore: score
      });
    } else {
      report.healthyItems.push({
        item,
        category,
        healthScore: score
      });
    }
  }

  const uniqueBadItems = [
    ...new Set(
      report.unhealthyItems.map(i => i.item)
    )
  ];

  uniqueBadItems.forEach(item => {

    const lower = item.toLowerCase();

    if (lower.includes("maggi")) {
      report.recommendations.push(
        "Reduce Maggi consumption."
      );

      report.swadeshiAlternatives.push(
        "Poha"
      );

      report.swadeshiAlternatives.push(
        "Millet Noodles"
      );
    }

    if (lower.includes("maida")) {
      report.recommendations.push(
        "Reduce refined flour consumption."
      );

      report.swadeshiAlternatives.push(
        "Whole Wheat Flour"
      );

      report.swadeshiAlternatives.push(
        "Besan"
      );
    }

    if (
      lower.includes("coke") ||
      lower.includes("pepsi")
    ) {
      report.recommendations.push(
        "Reduce sugary drinks."
      );

      report.swadeshiAlternatives.push(
        "Nimbu Pani"
      );

      report.swadeshiAlternatives.push(
        "Coconut Water"
      );
    }
  });

  report.estimatedSavings =
    report.unhealthyItems.length * 50;

  return report;
}

module.exports = {
  generateRecommendations
};