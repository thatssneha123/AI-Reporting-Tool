const path = require("path");
const insightAgent = require("../orchestrator/agents/InsightAgent");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");
const domainAgent = require("../orchestrator/agents/DomainAgent");

async function testInsightAgent() {
  console.log("Running InsightAgent Unit Tests...\n");
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
    // Test 1: Observations for Grocery Dataset
    console.log("Test 1: Intelligent Observations for Grocery Dataset");
    const groceryData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Maida", amount: 60, date: "2024-01-02" },
      { item: "Coke", amount: 40, date: "2024-01-03" },
      { item: "Milk", amount: 50, date: "2024-01-04" },
    ];

    const groceryProfile = await datasetAgent.process(groceryData, { filename: "grocery.csv", fileType: "csv" });
    const groceryDomain = await domainAgent.process(groceryProfile);

    const groceryInsights = insightAgent.generate({
      datasetProfile: groceryProfile,
      domainIntelligence: groceryDomain,
    });

    assert(groceryInsights.title === "Business Insights", "Returns correct title");
    assert(Array.isArray(groceryInsights.insights) && groceryInsights.insights.length > 0, `Generated ${groceryInsights.insights.length} observations`);
    assert(groceryInsights.insights.some(obs => obs.includes("Health score")), "Includes Health Score interpretation");
    assert(groceryInsights.insights.some(obs => obs.includes("Data quality score")), "Includes Data Quality observation");

    // Test 2: Observations for Sales Dataset (Outliers & Correlations)
    console.log("\nTest 2: Intelligent Observations for Sales Dataset");
    const salesFilePath = path.join(__dirname, "../sample-data/sales.csv");
    const salesProfile = await datasetAgent.process(salesFilePath);
    const salesDomain = await domainAgent.process(salesProfile);

    const salesInsights = insightAgent.generate({
      datasetProfile: salesProfile,
      domainIntelligence: salesDomain,
    });

    assert(Array.isArray(salesInsights.insights) && salesInsights.insights.length > 0, `Generated ${salesInsights.insights.length} observations for Sales`);
    assert(salesInsights.insights.some(obs => obs.includes("Average revenue") || obs.includes("Dominant region")), "Includes Statistical/Category trend observation");
    assert(salesInsights.insights.some(obs => obs.includes("correlation")), "Includes Correlation observation");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nInsightAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testInsightAgent();
