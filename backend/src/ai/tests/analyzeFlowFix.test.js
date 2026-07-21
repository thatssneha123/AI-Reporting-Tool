const path = require("path");
const { analyzeFileWithAi } = require("../../services/ai.service");

async function testAnalyzeFlowFix() {
  console.log("Testing Analyze Flow Fix...\n");
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

  const sampleFilePath = path.join(__dirname, "../sample-data/sales.csv");

  try {
    // 1. Test Dashboard Mode (empty query)
    console.log("Test 1: Dashboard Mode (empty query)");
    const dashResult = await analyzeFileWithAi({ filePath: sampleFilePath, query: "" });
    assert(dashResult && dashResult.dashboardMode === true, "Dashboard mode returns dashboardMode = true");
    assert(Array.isArray(dashResult.charts), "Dashboard mode returns charts array");

    // 2. Test Analyze Mode (specific non-empty query)
    console.log("\nTest 2: Analyze Mode (specific query: 'top 5 products by revenue')");
    const analyzeResult = await analyzeFileWithAi({ filePath: sampleFilePath, query: "top 5 products by revenue" });
    assert(analyzeResult && typeof analyzeResult.chartType === "string", "Analyze mode returns valid chartType");
    assert(Array.isArray(analyzeResult.chartData), "Analyze mode returns valid chartData array without ReferenceError");
    assert(typeof analyzeResult.insights === "string", "Analyze mode returns insights string");
    assert(analyzeResult.datasetIntelligence !== null, "Analyze mode includes datasetIntelligence");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nAnalyze Flow Fix Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testAnalyzeFlowFix();
