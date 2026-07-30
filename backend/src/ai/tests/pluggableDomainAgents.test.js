const path = require("path");
const domainAgent = require("../orchestrator/agents/DomainAgent");
const plannerAgent = require("../orchestrator/agents/PlannerAgent");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");
const salesAgent = require("../orchestrator/agents/SalesAgent");
const hrAgent = require("../orchestrator/agents/HRAgent");
const financeAgent = require("../orchestrator/agents/FinanceAgent");
const healthcareAgent = require("../orchestrator/agents/HealthcareAgent");
const genericAgent = require("../orchestrator/agents/GenericAgent");
const groceryAgent = require("../orchestrator/agents/GroceryAgent");

async function testPluggableDomainAgents() {
  console.log("Running Pluggable Domain Agents Unit Tests...\n");
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
    // Test 1: SalesAgent direct execution & routing
    console.log("Test 1: SalesAgent Execution");
    const salesRes = await salesAgent.process({ intelligence: { dataset: { domain: "Sales" } } });
    assert(salesRes.domain === "Sales", 'SalesAgent returns domain "Sales"');
    assert(salesRes.domainType === "Sales Intelligence", 'SalesAgent returns domainType "Sales Intelligence"');
    assert(Array.isArray(salesRes.aiSuggestions), "SalesAgent provides AI suggestions");
    assert(Array.isArray(salesRes.suggestedQuestions), "SalesAgent provides suggested questions");

    // Test 2: HRAgent direct execution & routing
    console.log("\nTest 2: HRAgent Execution");
    const hrRes = await hrAgent.process({ intelligence: { dataset: { domain: "HR" } } });
    assert(hrRes.domain === "HR", 'HRAgent returns domain "HR"');
    assert(hrRes.domainType === "HR Intelligence", 'HRAgent returns domainType "HR Intelligence"');

    // Test 3: FinanceAgent direct execution & routing
    console.log("\nTest 3: FinanceAgent Execution");
    const finRes = await financeAgent.process({ intelligence: { dataset: { domain: "Finance" } } });
    assert(finRes.domain === "Finance", 'FinanceAgent returns domain "Finance"');
    assert(finRes.domainType === "Finance Intelligence", 'FinanceAgent returns domainType "Finance Intelligence"');

    // Test 4: HealthcareAgent direct execution & routing
    console.log("\nTest 4: HealthcareAgent Execution");
    const healthRes = await healthcareAgent.process({ intelligence: { dataset: { domain: "Healthcare" } } });
    assert(healthRes.domain === "Healthcare", 'HealthcareAgent returns domain "Healthcare"');
    assert(healthRes.domainType === "Healthcare Intelligence", 'HealthcareAgent returns domainType "Healthcare Intelligence"');

    // Test 5: GenericAgent direct execution & routing
    console.log("\nTest 5: GenericAgent Execution");
    const genRes = await genericAgent.process({ intelligence: { dataset: { domain: "Generic" } } });
    assert(genRes.domain === "Generic", 'GenericAgent returns domain "Generic"');
    assert(genRes.domainType === "Generic Intelligence", 'GenericAgent returns domainType "Generic Intelligence"');

    // Test 6: DomainAgent Router selects correct pluggable agent
    console.log("\nTest 6: DomainAgent Router Selection");
    const salesAgentFromRouter = domainAgent.getAgent("Sales");
    assert(salesAgentFromRouter === salesAgent, "DomainAgent router returns salesAgent instance for Sales");

    const hrAgentFromRouter = domainAgent.getAgent("HR");
    assert(hrAgentFromRouter === hrAgent, "DomainAgent router returns hrAgent instance for HR");

    const finAgentFromRouter = domainAgent.getAgent("Finance");
    assert(finAgentFromRouter === financeAgent, "DomainAgent router returns financeAgent instance for Finance");

    const healthAgentFromRouter = domainAgent.getAgent("Healthcare");
    assert(healthAgentFromRouter === healthcareAgent, "DomainAgent router returns healthcareAgent instance for Healthcare");

    const genericAgentFromRouter = domainAgent.getAgent("UnknownDomain");
    assert(genericAgentFromRouter === genericAgent, "DomainAgent router returns genericAgent instance for unknown domain");

    // Test 7: PlannerAgent selects correct pluggable agent name
    console.log("\nTest 7: PlannerAgent Domain Agent Selection");
    assert(plannerAgent.getDomainAgentName("sales") === "SalesAgent", "PlannerAgent maps sales -> SalesAgent");
    assert(plannerAgent.getDomainAgentName("hr") === "HRAgent", "PlannerAgent maps hr -> HRAgent");
    assert(plannerAgent.getDomainAgentName("finance") === "FinanceAgent", "PlannerAgent maps finance -> FinanceAgent");
    assert(plannerAgent.getDomainAgentName("healthcare") === "HealthcareAgent", "PlannerAgent maps healthcare -> HealthcareAgent");
    assert(plannerAgent.getDomainAgentName("grocery") === "GroceryAgent", "PlannerAgent maps grocery -> GroceryAgent");
    assert(plannerAgent.getDomainAgentName("unknown") === "GenericAgent", "PlannerAgent maps unknown -> GenericAgent");

    // Test 8: GroceryAgent functionality remains 100% intact
    console.log("\nTest 8: GroceryAgent Unaffected Check");
    const groceryData = [
      { item: "Maggi", amount: 100, date: "2024-01-01" },
      { item: "Milk", amount: 50, date: "2024-01-02" },
    ];
    const groceryRes = await groceryAgent.process({ dataset: groceryData });
    assert(groceryRes.isGroceryDomain === true, "GroceryAgent processes grocery data correctly");
    assert(groceryRes.consumptionReport !== null, "GroceryAgent generates consumptionReport");
    assert(groceryRes.recommendationReport !== null, "GroceryAgent generates recommendationReport");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nPluggable Domain Agents Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testPluggableDomainAgents();
