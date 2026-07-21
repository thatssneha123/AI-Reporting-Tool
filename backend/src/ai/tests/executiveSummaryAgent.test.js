const path = require("path");
const executiveSummaryAgent = require("../orchestrator/agents/ExecutiveSummaryAgent");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");
const domainAgent = require("../orchestrator/agents/DomainAgent");
const insightAgent = require("../orchestrator/agents/InsightAgent");
const orchestrator = require("../orchestrator/orchestrator");

async function testExecutiveSummaryAgent() {
  console.log("Running ExecutiveSummaryAgent Unit Tests...\n");
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
    // Test 1: Executive Summary for Grocery Dataset
    console.log("Test 1: Executive Summary for Grocery Dataset");
    const groceryData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Maida", amount: 60, date: "2024-01-02" },
      { item: "Coke", amount: 40, date: "2024-01-03" },
      { item: "Milk", amount: 50, date: "2024-01-04" },
    ];

    const groceryProfile = await datasetAgent.process(groceryData, { filename: "grocery.csv", fileType: "csv" });
    const groceryDomain = await domainAgent.process(groceryProfile);
    const groceryInsights = await insightAgent.generate(groceryProfile);

    const grocerySummary = executiveSummaryAgent.generate({
      datasetProfile: groceryProfile,
      domainIntelligence: groceryDomain,
      insights: groceryInsights,
    });

    assert(grocerySummary.title === "Executive Summary", "Generates correct title");
    assert(typeof grocerySummary.text === "string" && grocerySummary.text.includes("grocery bill contains 4 purchased items"), `Dynamic Grocery text generated: "${grocerySummary.text}"`);
    assert(grocerySummary.text.includes("healthy") && grocerySummary.text.includes("save"), "Includes health & savings metrics dynamically");

    // Test 2: Executive Summary for Sales Dataset
    console.log("\nTest 2: Executive Summary for Sales Dataset");
    const salesFilePath = path.join(__dirname, "../sample-data/sales.csv");
    const salesProfile = await datasetAgent.process(salesFilePath);
    const salesDomain = await domainAgent.process(salesProfile);
    const salesInsights = await insightAgent.generate(salesProfile);

    const salesSummary = executiveSummaryAgent.generate({
      datasetProfile: salesProfile,
      domainIntelligence: salesDomain,
      insights: salesInsights,
    });

    assert(salesSummary.title === "Executive Summary", "Generates correct title for Sales");
    assert(typeof salesSummary.text === "string" && salesSummary.text.includes("transactions"), `Dynamic Sales text generated: "${salesSummary.text}"`);

    // Test 3: Orchestrator Integration with ExecutiveSummaryAgent
    console.log("\nTest 3: Orchestrator Integration with ExecutiveSummaryAgent");
    const dashboard = await orchestrator.processDataset(groceryData, { filename: "grocery.csv", fileType: "csv" });
    assert(dashboard.executiveSummary !== undefined, "Orchestrator includes executiveSummary object");
    assert(dashboard.executiveSummary.title === "Executive Summary", "Dashboard executive summary title is correct");
    assert(typeof dashboard.executiveSummary.text === "string" && dashboard.executiveSummary.text.length > 0, "Dashboard executive summary text is present");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nExecutiveSummaryAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testExecutiveSummaryAgent();
