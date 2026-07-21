const path = require("path");
const domainAgent = require("../orchestrator/agents/DomainAgent");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");

async function testDomainAgent() {
  console.log("Running DomainAgent Unit Tests...\n");
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
    // Test 1: Grocery Domain Intelligence
    console.log("Test 1: Grocery Domain Routing");
    const groceryData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Maida", amount: 60, date: "2024-01-02" },
      { item: "Coke", amount: 40, date: "2024-01-03" },
      { item: "Milk", amount: 50, date: "2024-01-04" },
    ];

    const datasetResult = await datasetAgent.process(groceryData, { filename: "grocery.csv", fileType: "csv" });
    const domainResult = await domainAgent.process(datasetResult);

    assert(domainResult.isGroceryDomain === true, "Identifies Grocery domain correctly");
    assert(domainResult.consumptionReport !== null, "Generates consumptionReport by reusing consumptionAnalyzer");
    assert(domainResult.recommendationReport !== null, "Generates recommendationReport by reusing recommendationEngine");
    assert(typeof domainResult.metrics.healthScore === "number", `Health Score: ${domainResult.metrics.healthScore}`);
    assert(typeof domainResult.metrics.estimatedSavings === "number", `Estimated Savings: ₹${domainResult.metrics.estimatedSavings}`);
    assert(typeof domainResult.metrics.healthySpend === "number", `Healthy Spend: ₹${domainResult.metrics.healthySpend}`);
    assert(typeof domainResult.metrics.unhealthySpend === "number", `Unhealthy Spend: ₹${domainResult.metrics.unhealthySpend}`);
    assert(Array.isArray(domainResult.items.healthyItems), "Lists healthy items");
    assert(Array.isArray(domainResult.items.unhealthyItems), "Lists unhealthy items");
    assert(Array.isArray(domainResult.items.swadeshiAlternatives) && domainResult.items.swadeshiAlternatives.length > 0, "Provides Swadeshi alternatives");
    assert(Array.isArray(domainResult.aiSuggestions) && domainResult.aiSuggestions.length > 0, "Provides AI Suggestions");
    assert(Array.isArray(domainResult.suggestedQuestions) && domainResult.suggestedQuestions.length > 0, "Provides Suggested Questions");

    // Test 2: Sales Domain Routing
    console.log("\nTest 2: Sales Domain Routing");
    const salesFilePath = path.join(__dirname, "../sample-data/sales.csv");
    const salesDatasetResult = await datasetAgent.process(salesFilePath);
    const salesDomainResult = await domainAgent.process(salesDatasetResult);

    assert(salesDomainResult.isGroceryDomain === false, "Identifies non-grocery domain (Sales)");
    assert(salesDomainResult.domain === "Sales", `Domain: "${salesDomainResult.domain}"`);
    assert(Array.isArray(salesDomainResult.aiSuggestions), "Provides domain-specific AI suggestions for Sales");
    assert(Array.isArray(salesDomainResult.suggestedQuestions), "Provides domain-specific suggested questions for Sales");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nDomainAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testDomainAgent();
