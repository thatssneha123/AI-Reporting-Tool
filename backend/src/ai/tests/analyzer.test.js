const { analyzeDataset, summarizeAnalysis } = require("../modules/datasetAnalyzer");

function generateMockDataset(rows = 100) {
  const regions = ["North", "South", "East", "West"];
  const products = ["Widget A", "Widget B", "Widget C"];
  const dataset = [];

  for (let i = 0; i < rows; i++) {
    dataset.push({
      id: i + 1,
      date: new Date(2023, Math.floor(i / 10), (i % 28) + 1).toISOString().split("T")[0],
      revenue: Math.random() > 0.05 ? parseFloat((Math.random() * 10000).toFixed(2)) : null,
      quantity: Math.floor(Math.random() * 100) + 1,
      region: regions[Math.floor(Math.random() * regions.length)],
      product: products[Math.floor(Math.random() * products.length)],
      active: Math.random() > 0.5 ? "true" : "false",
    });
  }
  return dataset;
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
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

  console.log("\n=== Dataset Analyzer Tests ===\n");

  const dataset = generateMockDataset(100);
  const analysis = analyzeDataset(dataset);

  test("returns correct row count", () => {
    assert(analysis.rowCount === 100, `Expected 100 rows, got ${analysis.rowCount}`);
  });

  test("detects correct column count", () => {
    assert(analysis.columnCount === 7, `Expected 7 columns, got ${analysis.columnCount}`);
  });

  test("detects numeric columns", () => {
    assert(analysis.numericColumns.includes("revenue"), "Should detect revenue as numeric");
    assert(analysis.numericColumns.includes("quantity"), "Should detect quantity as numeric");
  });

  test("detects categorical columns", () => {
    assert(analysis.categoricalColumns.includes("region"), "Should detect region as categorical");
    assert(analysis.categoricalColumns.includes("product"), "Should detect product as categorical");
  });

  test("detects datetime columns", () => {
    assert(analysis.datetimeColumns.includes("date"), "Should detect date as datetime");
  });

  test("computes numeric stats for revenue", () => {
    const stats = analysis.numericStats["revenue"];
    assert(stats, "Should have stats for revenue");
    assert(typeof stats.mean === "number", "Mean should be a number");
    assert(typeof stats.min === "number", "Min should be a number");
    assert(typeof stats.max === "number", "Max should be a number");
    assert(stats.max >= stats.min, "Max should be >= min");
  });

  test("computes categorical value counts", () => {
    const regionCounts = analysis.categoricalStats["region"];
    assert(Array.isArray(regionCounts), "Region stats should be array");
    assert(regionCounts.length > 0, "Should have region counts");
    assert(regionCounts[0].value, "Each count should have a value");
    assert(typeof regionCounts[0].count === "number", "Each count should have a count");
  });

  test("detects missing values", () => {
    const missingStats = analysis.missingStats["revenue"];
    assert(missingStats, "Should have missing stats for revenue");
    assert(typeof missingStats.missing === "number", "Missing count should be a number");
    assert(typeof missingStats.missingPercent === "string", "Missing percent should be a string");
  });

  test("computes quality score between 0 and 100", () => {
    assert(analysis.qualityScore >= 0, "Quality score should be >= 0");
    assert(analysis.qualityScore <= 100, "Quality score should be <= 100");
  });

  test("includes sample rows", () => {
    assert(Array.isArray(analysis.sampleRows), "Sample rows should be an array");
    assert(analysis.sampleRows.length === 5, `Expected 5 sample rows, got ${analysis.sampleRows.length}`);
  });

  test("computes correlations between numeric columns", () => {
    assert(typeof analysis.correlations === "object", "Correlations should be an object");
    const corrKeys = Object.keys(analysis.correlations);
    assert(corrKeys.length > 0, "Should have at least one correlation pair");
  });

  test("summarizeAnalysis returns correct shape", () => {
    const summary = summarizeAnalysis(analysis);
    assert(summary.shape, "Should have shape");
    assert(summary.typeBreakdown, "Should have typeBreakdown");
    assert(typeof summary.qualityScore === "number", "Quality score should be a number");
  });

  test("handles empty dataset gracefully", () => {
    const empty = analyzeDataset([]);
    assert(empty.error, "Should return error for empty dataset");
  });

  test("handles single row dataset", () => {
    const single = analyzeDataset([{ a: 1, b: "foo" }]);
    assert(single.rowCount === 1, "Should handle single row");
    assert(single.columnCount === 2, "Should detect 2 columns");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

runTests();

module.exports = { runTests };