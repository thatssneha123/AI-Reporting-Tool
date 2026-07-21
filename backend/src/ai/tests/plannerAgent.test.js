const path = require("path");
const plannerAgent = require("../orchestrator/agents/PlannerAgent");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");
const orchestrator = require("../orchestrator/orchestrator");

async function testPlannerAgent() {
  console.log("Running PlannerAgent Unit Tests...\n");
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
    // Test 1: Plan for Grocery Dataset
    console.log("Test 1: Plan Generation for Grocery Dataset");
    const groceryData = [{ item: "Maggi", amount: 100 }, { item: "Milk", amount: 50 }];
    const groceryProfile = await datasetAgent.process(groceryData, { filename: "grocery.csv", fileType: "csv" });
    const groceryPlan = plannerAgent.createPlan(groceryProfile);

    assert(groceryPlan.domain === "Grocery", `Plan domain: "${groceryPlan.domain}"`);
    assert(Array.isArray(groceryPlan.plan), "Plan contains plan array");
    assert(groceryPlan.plan.includes("DomainAgent"), "Grocery plan includes DomainAgent");
    assert(groceryPlan.plan.includes("DashboardAgent"), "Grocery plan includes DashboardAgent");
    assert(groceryPlan.steps.length === 4, "Grocery plan contains 4 execution steps");

    // Test 2: Plan for Sales Dataset
    console.log("\nTest 2: Plan Generation for Sales Dataset");
    const salesFilePath = path.join(__dirname, "../sample-data/sales.csv");
    const salesProfile = await datasetAgent.process(salesFilePath);
    const salesPlan = plannerAgent.createPlan(salesProfile);

    assert(salesPlan.domain === "Sales", `Plan domain: "${salesPlan.domain}"`);
    assert(salesPlan.plan.includes("DomainAgent"), "Sales plan includes DomainAgent");
    assert(salesPlan.plan.includes("InsightAgent"), "Sales plan includes InsightAgent");

    // Test 3: Plan for Generic Dataset
    console.log("\nTest 3: Plan Generation for Generic Dataset");
    const genericProfile = { domain: "Generic", datasetType: "Generic Dataset" };
    const genericPlan = plannerAgent.createPlan(genericProfile);

    assert(genericPlan.domain === "Generic", "Generic plan domain identified");
    assert(genericPlan.plan.includes("InsightAgent"), "Generic plan includes InsightAgent");
    assert(genericPlan.plan.includes("DashboardAgent"), "Generic plan includes DashboardAgent");

    // Test 4: Orchestrator Integration with PlannerAgent
    console.log("\nTest 4: Orchestrator Execution with PlannerAgent");
    const fullResult = await orchestrator.processDataset(salesFilePath);
    assert(fullResult.executionPlan !== undefined, "Orchestrator output includes executionPlan");
    assert(fullResult.executionPlan.domain === "Sales", "Orchestrator plan reflects Sales domain");
    assert(fullResult.dashboardMode === true, "Preserves dashboardMode = true");
    assert(Array.isArray(fullResult.charts) && fullResult.charts.length > 0, "Preserves computed charts");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nPlannerAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testPlannerAgent();
