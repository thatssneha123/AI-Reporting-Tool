const { classifyProduct } = require("../utils/productClassifier");
const { getHealthScore } = require("../utils/healthScorer");

function analyzeConsumption(dataset) {
  let totalSpend = 0;
  let healthySpend = 0;
  let unhealthySpend = 0;

  const itemStats = {};
  const categoryStats = {};

  const monthlySpend = {};
  const monthlyHealthySpend = {};
  const monthlyUnhealthySpend = {};

  for (const row of dataset) {
    const item =
      row.item ||
      row.product ||
      row.product_name ||
      "Unknown";

    const amount = Number(
      row.amount ||
      row.price ||
      row.total ||
      0
    );

    const dateValue = row.date || row.purchase_date || null;

    const category = classifyProduct(item);

    const healthScore =
      getHealthScore(category);

    totalSpend += amount;

    if (healthScore <= 3) {
      unhealthySpend += amount;
    } else {
      healthySpend += amount;
    }

    // ------------------------
    // Item Stats
    // ------------------------

    if (!itemStats[item]) {
      itemStats[item] = {
        item,
        count: 0,
        spend: 0
      };
    }

    itemStats[item].count += 1;
    itemStats[item].spend += amount;

    // ------------------------
    // Category Stats
    // ------------------------

    if (!categoryStats[category]) {
      categoryStats[category] = {
        category,
        spend: 0
      };
    }

    categoryStats[category].spend += amount;

    // ------------------------
    // Monthly Stats
    // ------------------------

    if (dateValue) {
      const monthKey =
        new Date(dateValue)
          .toISOString()
          .slice(0, 7);

      if (!monthlySpend[monthKey]) {
        monthlySpend[monthKey] = 0;
      }

      if (!monthlyHealthySpend[monthKey]) {
        monthlyHealthySpend[monthKey] = 0;
      }

      if (!monthlyUnhealthySpend[monthKey]) {
        monthlyUnhealthySpend[monthKey] = 0;
      }

      monthlySpend[monthKey] += amount;

      if (healthScore <= 3) {
        monthlyUnhealthySpend[monthKey] += amount;
      } else {
        monthlyHealthySpend[monthKey] += amount;
      }
    }
  }

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  const topCategories =
    Object.values(categoryStats)
      .sort((a, b) => b.spend - a.spend);

  const overallHealthScore =
    totalSpend === 0
      ? 0
      : Math.round(
          (healthySpend / totalSpend) * 100
        );

  const monthlyHealthScore = {};

  Object.keys(monthlySpend).forEach(month => {
    const total =
      monthlySpend[month];

    const healthy =
      monthlyHealthySpend[month] || 0;

    monthlyHealthScore[month] =
      total === 0
        ? 0
        : Math.round(
            (healthy / total) * 100
          );
  });

  const estimatedSavings =
    Math.round(unhealthySpend * 0.4);

  return {
    totalSpend,
    healthySpend,
    unhealthySpend,

    healthScore:
      overallHealthScore,

    estimatedSavings,

    topItems,

    topCategories,

    monthlySpend,

    monthlyHealthySpend,

    monthlyUnhealthySpend,

    monthlyHealthScore
  };
}

module.exports = {
  analyzeConsumption
};