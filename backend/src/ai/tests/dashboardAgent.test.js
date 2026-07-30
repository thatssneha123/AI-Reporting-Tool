const path = require("path");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");
const domainAgent = require("../orchestrator/agents/DomainAgent");
const insightAgent = require("../orchestrator/agents/InsightAgent");
const dashboardAgent = require("../orchestrator/agents/DashboardAgent");

async function testDashboardAgent() {
  console.log("Running DashboardAgent Unit Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Assembly for Grocery Dataset
    console.log("Test 1: DashboardAgent Assembly for Grocery Dataset");
    const groceryData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Maida", amount: 60, date: "2024-01-02" },
      { item: "Coke", amount: 40, date: "2024-01-03" },
      { item: "Milk", amount: 50, date: "2024-01-04" },
    ];

    const datasetProfile = await datasetAgent.process(groceryData, { filename: "grocery.csv", fileType: "csv" });
    const domainIntelligence = await domainAgent.process(datasetProfile);
    const insights = await insightAgent.generate(datasetProfile);

    const dashboard = await dashboardAgent.assemble({ datasetProfile, domainIntelligence, insights });

    assert(dashboard.dashboardMode === true, "Dashboard has dashboardMode = true");
    assert(dashboard.domain === "Grocery", `Domain: "${dashboard.domain}"`);
    assert(Array.isArray(dashboard.charts) && dashboard.charts.length > 0, `Contains ${dashboard.charts?.length || 0} charts with computed data`);
    assert(dashboard.kpis && Array.isArray(dashboard.kpis.cards), "Contains KPI cards");
    assert(dashboard.executiveSummary && typeof dashboard.executiveSummary.text === "string", "Contains Executive Summary text");
    assert(dashboard.consumptionReport !== undefined, "Automatically includes Grocery Consumption Report");
    assert(dashboard.recommendationReport !== undefined, "Automatically includes Grocery Recommendation Report");
    assert(dashboard.domainIntelligence !== undefined, "Includes Domain Intelligence payload");

    // Test 2: Assembly for Sales Dataset
    console.log("\nTest 2: DashboardAgent Assembly for Sales Dataset");
    const salesFilePath = path.join(__dirname, "../sample-data/sales.csv");
    const salesProfile = await datasetAgent.process(salesFilePath);
    const salesDomain = await domainAgent.process(salesProfile);
    const salesInsights = await insightAgent.generate(salesProfile);

    const salesDashboard = await dashboardAgent.assemble({
      datasetProfile: salesProfile,
      domainIntelligence: salesDomain,
      insights: salesInsights,
    });

    assert(salesDashboard.dashboardMode === true, "Sales dashboard has dashboardMode = true");
    assert(salesDashboard.domain === "Sales", `Sales domain: "${salesDashboard.domain}"`);
    assert(salesDashboard.executiveSummary && salesDashboard.executiveSummary.title === "Executive Summary", "Generates Executive Summary for Sales");
    assert(Array.isArray(salesDashboard.charts) && salesDashboard.charts.length > 0, "Generates charts with computed data for Sales");
    assert(!salesDashboard.consumptionReport, "Non-grocery datasets omit consumptionReport");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nDashboardAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testDashboardAgent();
