const path = require("path");
const orchestrator = require("../orchestrator/orchestrator");

async function testOrchestrator() {
  console.log("Running AI Orchestrator Phase 1 Unit Tests...");
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
    const sampleFilePath = path.join(__dirname, "../sample-data/sales.csv");
    console.log(`Testing with file: ${sampleFilePath}`);

    const result = await orchestrator.processDataset(sampleFilePath);

    assert(result !== null && typeof result === "object", "Returns a structured dashboard object");
    assert(result.dashboardMode === true, "Result has dashboardMode = true");
    assert(typeof result.domain === "string", `Result contains domain: "${result.domain}"`);
    assert(Array.isArray(result.charts), `Result contains charts array (count: ${result.charts?.length || 0})`);
    assert(result.charts.length > 0, "Charts array is non-empty");
    assert(result.kpis && Array.isArray(result.kpis.cards), "Result contains KPI cards");
    assert(result.summary && result.summary.metrics, "Result contains summary metrics");
    assert(result.quality && typeof result.quality.metrics.dataQualityScore === "number", "Result contains quality metrics");
    assert(result.insights && Array.isArray(result.insights.insights), "Result contains insights");
    assert(result.recommendations && Array.isArray(result.recommendations.recommendations), "Result contains recommendations");
    assert(result.questions && Array.isArray(result.questions.questions), "Result contains suggested next questions");

    // Test with array input directly
    const rawData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Milk", amount: 50, date: "2024-01-02" },
    ];

    const groceryResult = await orchestrator.processDataset(rawData, { filename: "grocery.csv", fileType: "csv" });
    assert(groceryResult.dashboardMode === true, "Processes array input directly");
    assert(groceryResult.consumptionReport !== undefined, "Attaches consumptionReport for Grocery/Expense data");
    assert(groceryResult.recommendationReport !== undefined, "Attaches recommendationReport for Grocery/Expense data");

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log(`\nOrchestrator Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testOrchestrator();
