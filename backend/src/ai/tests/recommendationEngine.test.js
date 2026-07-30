const assert = require("assert");
const { generateRecommendations } = require("../modules/recommendationEngine");

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

  console.log("\n=== Recommendation Engine Tests ===\n");

  test("skips rows without item or product names", () => {
    const report = generateRecommendations([
      { City: "Delhi", Fan: "120", Refrigerator: "240" },
      { item: "", amount: "50" },
      { product: "Milk", amount: "60" },
    ]);

    assert.strictEqual(report.unhealthyItems.length, 0);
    assert.strictEqual(report.healthyItems.length, 1);
    assert.strictEqual(report.healthyItems[0].item, "Milk");
    assert.notStrictEqual(report.healthyItems[0].item, "(unknown)");
  });

  test("deduplicates healthy and unhealthy item names before returning", () => {
    const report = generateRecommendations([
      { item: "Milk", amount: "60" },
      { item: "milk", amount: "65" },
      { item: "Maggi", amount: "40" },
      { product_name: "maggi", amount: "45" },
    ]);

    assert.deepStrictEqual(report.healthyItems.map((item) => item.item), ["Milk"]);
    assert.deepStrictEqual(report.unhealthyItems.map((item) => item.item), ["Maggi"]);
    assert.strictEqual(report.estimatedSavings, 50);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  const result = runTests();
  process.exitCode = result.failed ? 1 : 0;
}

module.exports = { runTests };
