/**
 * Dashboard Integration Test
 * Simulates the complete API flow: Load data -> Intelligence analysis -> Dashboard generation -> Data computation
 */

const { analyzeDatasetIntelligence } = require("../modules/datasetIntelligenceAgent");
const { analyzeDataset } = require("../modules/datasetAnalyzer");
const { generateDashboard, shouldTriggerDashboard } = require("../modules/dashboardGenerator");
const { computeAllChartData } = require("../modules/dashboardDataCompute");

console.log("=== Dashboard Integration Test ===\n");

// Simulated dataset
const sampleData = [
  { date: "2024-01-01", category: "Electronics", amount: 1500, quantity: 3 },
  { date: "2024-01-02", category: "Clothing", amount: 800, quantity: 5 },
  { date: "2024-01-03", category: "Electronics", amount: 2000, quantity: 2 },
  { date: "2024-01-04", category: "Food", amount: 300, quantity: 10 },
  { date: "2024-01-05", category: "Clothing", amount: 600, quantity: 3 },
  { date: "2024-01-06", category: "Electronics", amount: 1800, quantity: 2 },
  { date: "2024-01-07", category: "Food", amount: 250, quantity: 8 },
  { date: "2024-01-08", category: "Clothing", amount: 900, quantity: 4 },
];

// Test 1: Query Trigger Detection
console.log("TEST 1: Query Trigger Detection");

const triggerQueries = ["", "   ", "Analyze", "Analyze data", "Generate dashboard"];
const nonTriggerQueries = ["Top products", "Revenue by category", "Show me sales"];

const triggerResults = triggerQueries.map(q => shouldTriggerDashboard(q));
const nonTriggerResults = nonTriggerQueries.map(q => shouldTriggerDashboard(q));

const allTriggersDetected = triggerResults.every(r => r === true);
const allNonTriggersDetected = nonTriggerResults.every(r => r === false);

console.log(`  Trigger queries detected: ${allTriggersDetected ? "✓ 5/5" : "✗"}`);
console.log(`  Non-trigger queries detected: ${allNonTriggersDetected ? "✓ 3/3" : "✗"}`);

if (allTriggersDetected && allNonTriggersDetected) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Test 2: Intelligence Analysis
console.log("TEST 2: Dataset Intelligence Analysis");

const intelligence = analyzeDatasetIntelligence(sampleData, {
  filename: "sample-data.csv",
  fileType: "csv",
});

const hasSchema = intelligence.schema !== undefined;
const hasColumns = Array.isArray(intelligence.schema.columns);
const hasNumerical = Array.isArray(intelligence.schema.numericalColumns);
const hasCategorical = Array.isArray(intelligence.schema.categoricalColumns);

console.log(`  Schema detected: ${hasSchema ? "✓" : "✗"}`);
console.log(`  Columns identified: ${intelligence.schema.columns?.length || 0}`);
console.log(`  Numerical columns: ${intelligence.schema.numericalColumns?.join(", ") || "none"}`);
console.log(`  Categorical columns: ${intelligence.schema.categoricalColumns?.join(", ") || "none"}`);

if (hasSchema && hasColumns && hasNumerical && hasCategorical) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Test 3: Dataset Analysis
console.log("TEST 3: Dataset Analysis");

const analysis = analyzeDataset(sampleData);

const hasRowCount = analysis.rowCount === sampleData.length;
const hasColumnCount = analysis.columnCount === Object.keys(sampleData[0]).length;
const hasSummary = analysis.summary !== undefined;

console.log(`  Row count: ${analysis.rowCount} ${hasRowCount ? "✓" : "✗"}`);
console.log(`  Column count: ${analysis.columnCount} ${hasColumnCount ? "✓" : "✗"}`);
console.log(`  Has summary: ${hasSummary ? "✓" : "✗"}`);

if (hasRowCount && hasColumnCount) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Test 4: Dashboard Generation
console.log("TEST 4: Dashboard Generation");

const dashboard = generateDashboard(intelligence, analysis);

const isDashboardMode = dashboard.dashboardMode === true;
const hasDomain = dashboard.domain !== undefined;
const hasCharts = Array.isArray(dashboard.charts) && dashboard.charts.length > 0;
const hasSummary2 = dashboard.summary !== undefined;
const hasKPIs = dashboard.kpis !== undefined;

console.log(`  Dashboard mode: ${isDashboardMode ? "✓" : "✗"}`);
console.log(`  Domain detected: ${hasDomain ? "✓ " + dashboard.domain : "✗"}`);
console.log(`  Charts generated: ${hasCharts ? "✓ " + dashboard.charts.length + " charts" : "✗"}`);
console.log(`  Summary present: ${hasSummary2 ? "✓" : "✗"}`);
console.log(`  KPIs present: ${hasKPIs ? "✓" : "✗"}`);

if (isDashboardMode && hasDomain && hasCharts && hasSummary2) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Test 5: Chart Data Computation
console.log("TEST 5: Chart Data Computation");

const chartsWithData = computeAllChartData(sampleData, dashboard.charts || [], intelligence);

const allChartsHaveData = chartsWithData.every(
  chart => chart.chartData && Array.isArray(chart.chartData) && chart.chartData.length > 0
);
const allDataPointsValid = chartsWithData.every(chart =>
  chart.chartData.every(point => {
    if (chart.chartType === "scatter") {
      return typeof point.x === "number" && typeof point.y === "number";
    } else {
      return point.hasOwnProperty("name") && typeof point.value === "number";
    }
  })
);

console.log(`  Charts computed: ${chartsWithData.length}`);
chartsWithData.forEach((chart, idx) => {
  const points = chart.chartData?.length || 0;
  console.log(`    Chart ${idx + 1} (${chart.chartType}): ${points} data points ${points > 0 ? "✓" : "✗"}`);
});

console.log(`  All charts have data: ${allChartsHaveData ? "✓" : "✗"}`);
console.log(`  All data points valid: ${allDataPointsValid ? "✓" : "✗"}`);

if (allChartsHaveData && allDataPointsValid) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Test 6: Complete Dashboard Response
console.log("TEST 6: Complete Dashboard Response Structure");

const finalResponse = {
  ...dashboard,
  charts: chartsWithData,
};

const responseValid =
  finalResponse.dashboardMode === true &&
  finalResponse.domain !== undefined &&
  finalResponse.charts.length > 0 &&
  finalResponse.charts.every(c => c.chartData && c.chartData.length > 0) &&
  finalResponse.summary !== undefined &&
  finalResponse.kpis !== undefined &&
  finalResponse.insights !== undefined &&
  finalResponse.recommendations !== undefined;

console.log(`  Response includes all required fields: ${responseValid ? "✓" : "✗"}`);
console.log(`  Ready for frontend rendering: ${responseValid ? "✓" : "✗"}`);

if (responseValid) {
  console.log("  ✓ PASSED\n");
} else {
  console.log("  ✗ FAILED\n");
}

// Summary
console.log("=== Integration Test Summary ===");
if (allTriggersDetected && hasSchema && isDashboardMode && allChartsHaveData && responseValid) {
  console.log("✓ Complete dashboard pipeline working correctly");
  console.log("✓ All data flows from input to final response");
  console.log("✓ Charts have computed data ready for rendering");
  console.log("✓ Response structure matches frontend expectations");
} else {
  console.log("✗ Some pipeline steps failed");
}
