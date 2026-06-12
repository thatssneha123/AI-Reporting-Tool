const { parseIntent } = require("../modules/intentParser");

const mockDatasetContext = {
  columns: ["date", "revenue", "region", "product", "quantity"],
  columnTypes: {
    date: "datetime",
    revenue: "numeric",
    region: "categorical",
    product: "categorical",
    quantity: "numeric",
  },
  rowCount: 1000,
};

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
      failed++;
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
  }

  console.log("\n=== Intent Parser Tests ===\n");

  await test("parses top-N intent", async () => {
    const intent = await parseIntent("Show me top 5 regions by revenue", mockDatasetContext);
    assert(intent.analysisType === "top_n", `Expected top_n, got ${intent.analysisType}`);
    assert(intent.topN === 5, `Expected topN=5, got ${intent.topN}`);
  });

  await test("parses trend intent with date column", async () => {
    const intent = await parseIntent("Show revenue trend over time", mockDatasetContext);
    assert(intent.analysisType === "trend", `Expected trend, got ${intent.analysisType}`);
    assert(
      intent.targetColumns.includes("date") || intent.targetColumns.includes("revenue"),
      "Expected date or revenue in targetColumns"
    );
  });

  await test("parses correlation intent", async () => {
    const intent = await parseIntent("What is the correlation between revenue and quantity?", mockDatasetContext);
    assert(intent.analysisType === "correlation", `Expected correlation, got ${intent.analysisType}`);
    assert(intent.targetColumns.length >= 2, "Expected at least 2 target columns");
  });

  await test("parses comparison intent", async () => {
    const intent = await parseIntent("Compare revenue by region", mockDatasetContext);
    assert(
      ["comparison", "aggregation", "top_n"].includes(intent.analysisType),
      `Unexpected analysisType: ${intent.analysisType}`
    );
  });

  await test("returns valid confidence score", async () => {
    const intent = await parseIntent("Summarize the dataset", mockDatasetContext);
    assert(typeof intent.confidence === "number", "Confidence should be a number");
    assert(intent.confidence >= 0 && intent.confidence <= 1, "Confidence should be 0-1");
  });

  await test("handles ambiguous input gracefully", async () => {
    const intent = await parseIntent("do something with the data", mockDatasetContext);
    assert(intent.analysisType, "Should have an analysisType");
    assert(Array.isArray(intent.targetColumns), "targetColumns should be an array");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

runTests().catch(console.error);

module.exports = { runTests };