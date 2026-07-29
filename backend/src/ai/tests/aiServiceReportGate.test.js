const assert = require("assert");
const { _private } = require("../../services/ai.service");

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

  console.log("\n=== AI Service Grocery Report Gate Tests ===\n");

  test("rejects utility datasets without item or product columns", () => {
    const hasGrocerySchema = _private.hasItemProductColumn([
      { City: "Delhi", Fan: "120", Refrigerator: "240", AirConditioner: "950", Tele: "80" },
    ]);

    assert.strictEqual(hasGrocerySchema, false);
  });

  test("accepts grocery item and product-name columns", () => {
    assert.strictEqual(_private.hasItemProductColumn([{ item: "Milk", amount: "60" }]), true);
    assert.strictEqual(_private.hasItemProductColumn([{ product_name: "Rice", amount: "700" }]), true);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  const result = runTests();
  process.exitCode = result.failed ? 1 : 0;
}

module.exports = { runTests };
