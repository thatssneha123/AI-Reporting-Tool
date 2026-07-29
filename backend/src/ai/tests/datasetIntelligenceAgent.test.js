const assert = require("assert");
const { analyzeDatasetIntelligence } = require("../modules/datasetIntelligenceAgent");

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  OK ${name}`);
      passed++;
    } catch (error) {
      console.log(`  FAIL ${name}: ${error.message}`);
      failed++;
    }
  }

  console.log("\n=== Dataset Intelligence Agent Tests ===\n");

  test("detects sales dataset schema and suggestions", () => {
    const result = analyzeDatasetIntelligence([
      { order_id: "ORD-001", order_date: "2025-01-01", customer: "Acme", region: "North", revenue: "1200", quantity: "3" },
      { order_id: "ORD-002", order_date: "2025-01-02", customer: "Bravo", region: "South", revenue: "800", quantity: "2" },
      { order_id: "ORD-003", order_date: "2025-01-03", customer: "Acme", region: "North", revenue: "1500", quantity: "4" },
    ], { filename: "sales.csv" });

    assert.strictEqual(result.dataset.domain, "Sales");
    assert.strictEqual(result.schema.totalRows, 3);
    assert.strictEqual(result.schema.totalColumns, 6);
    assert(result.schema.numericalColumns.includes("revenue"));
    assert(result.schema.dateColumns.includes("order_date"));
    assert(result.schema.currencyColumns.includes("revenue"));
    assert(result.schema.identifierColumns.includes("order_id"));
    assert(result.suggestions.bestChartTypes.some((chart) => chart.type === "line"));
    assert(result.suggestions.kpiCards.some((card) => card.metric === "revenue"));
  });

  test("calculates missing values, duplicate rows, and quality score", () => {
    const result = analyzeDatasetIntelligence([
      { product_id: "P-001", product: "Milk", category: "Dairy", price: "60", stock: "10" },
      { product_id: "P-001", product: "Milk", category: "Dairy", price: "60", stock: "10" },
      { product_id: "P-002", product: "Bread", category: "", price: "", stock: "5" },
    ], { filename: "inventory.xlsx" });

    assert.strictEqual(result.quality.duplicateRows, 1);
    assert.strictEqual(result.quality.missingValues.totalMissing, 2);
    assert(result.quality.dataQualityScore < 100);
    assert(result.schema.currencyColumns.includes("price"));
  });

  test("detects movies domain from media fields", () => {
    const result = analyzeDatasetIntelligence([
      { title: "Example Movie", director: "Jane Doe", genre: "Drama", release_year: "2024", rating: "PG" },
      { title: "Example Show", director: "John Doe", genre: "Comedy", release_year: "2023", rating: "TV-14" },
    ], { filename: "netflix_titles.xls" });

    assert.strictEqual(result.dataset.domain, "Movies");
    assert.strictEqual(result.dataset.inferredType, "Media Catalog");
    assert(result.schema.categoricalColumns.includes("genre"));
  });

  test("does not classify utility appliance usage as grocery", () => {
    const result = analyzeDatasetIntelligence([
      { City: "Delhi", Fan: "120", Refrigerator: "240", AirConditioner: "950", Tele: "80" },
      { City: "Mumbai", Fan: "110", Refrigerator: "220", AirConditioner: "870", Tele: "75" },
      { City: "Pune", Fan: "90", Refrigerator: "210", AirConditioner: "760", Tele: "68" },
    ], { filename: "electricity_bill_dataset.csv" });

    assert.notStrictEqual(result.dataset.domain, "Grocery");
    assert(!result.dataset.domainSignals.includes("item"));
    assert(!result.dataset.domainSignals.includes("amount"));
    assert(!result.dataset.domainSignals.includes("quantity"));
  });

  test("keeps grocery sample behavior with food item signals", () => {
    const result = analyzeDatasetIntelligence([
      { date: "2025-01-01", item: "Maggi", quantity: "2", amount: "40" },
      { date: "2025-01-02", item: "Milk", quantity: "1", amount: "60" },
      { date: "2025-01-03", item: "Rice", quantity: "10", amount: "700" },
    ], { filename: "grocery-sample.csv" });

    assert.strictEqual(result.dataset.domain, "Grocery");
    assert(result.dataset.domainSignals.includes("grocery"));
    assert(result.dataset.domainSignals.includes("milk"));
    assert(result.dataset.domainSignals.includes("rice"));
  });

  test("returns a structured error for empty datasets", () => {
    const result = analyzeDatasetIntelligence([]);
    assert.strictEqual(result.error, "Empty dataset");
    assert.strictEqual(result.agent, "Dataset Intelligence Agent");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  const result = runTests();
  process.exitCode = result.failed ? 1 : 0;
}

module.exports = { runTests };
