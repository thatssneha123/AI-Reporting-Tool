/**
 * Tests for the Agent System Infrastructure (Phase 1)
 * 
 * Verifies: BaseAgent, AgentContext, AgentRegistry, AgentLogger, AgentOrchestrator
 * 
 * Run: node src/ai/tests/agentInfrastructure.test.js
 */

const BaseAgent = require("../agents/orchestrator/baseAgent");
const AgentContext = require("../agents/orchestrator/agentContext");
const AgentRegistry = require("../agents/orchestrator/agentRegistry");
const AgentLogger = require("../agents/orchestrator/agentLogger");
const AgentOrchestrator = require("../agents/orchestrator/agentOrchestrator");

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${label}`);
  }
}

// ═══════════════════════════════════════════════════
// 1. BaseAgent Tests
// ═══════════════════════════════════════════════════
console.log("\n══ BaseAgent Tests ══");

// Cannot instantiate directly
try {
  new BaseAgent({ name: "Test", description: "test" });
  assert(false, "BaseAgent should not be directly instantiatable");
} catch (e) {
  assert(e.message.includes("abstract"), "BaseAgent is abstract");
}

// Subclass works
class TestAgent extends BaseAgent {
  constructor() {
    super({
      name: "TestAgent",
      description: "A test agent",
      requires: ["dataset"],
      produces: ["testResult"],
    });
  }
  async run(context) {
    context.set("testResult", { value: 42 });
  }
}

const testAgent = new TestAgent();
assert(testAgent.name === "TestAgent", "Agent has correct name");
assert(testAgent.description === "A test agent", "Agent has description");
assert(testAgent.requires.length === 1, "Agent declares requires");
assert(testAgent.produces.length === 1, "Agent declares produces");

// Name is required
try {
  class BadAgent extends BaseAgent {
    constructor() { super({ description: "no name" }); }
    async run() {}
  }
  new BadAgent();
  assert(false, "Agent without name should throw");
} catch (e) {
  assert(e.message.includes("name"), "Agent requires name");
}


// ═══════════════════════════════════════════════════
// 2. AgentContext Tests
// ═══════════════════════════════════════════════════
console.log("\n══ AgentContext Tests ══");

// Basic construction
const ctx1 = new AgentContext({ filePath: "/test/data.csv", query: "top 10 products" });
assert(ctx1.query === "top 10 products", "Context stores query");
assert(ctx1.request.filePath === "/test/data.csv", "Context stores filePath");
assert(!ctx1.isDashboardMode, "Non-empty query is not dashboard mode");

// Dashboard mode
const ctx2 = new AgentContext({ filePath: "/test/data.csv", query: "" });
assert(ctx2.isDashboardMode, "Empty query is dashboard mode");

const ctx3 = new AgentContext({ filePath: "/test/data.csv", query: "   " });
assert(ctx3.isDashboardMode, "Whitespace-only query is dashboard mode");

// Get/Set/Has
const ctx4 = new AgentContext({});
assert(!ctx4.has("dataset"), "has() returns false for missing key");
ctx4.set("dataset", [{ a: 1 }]);
assert(ctx4.has("dataset"), "has() returns true after set");
assert(ctx4.dataset.length === 1, "Convenience getter works");

// Null values
ctx4.set("nullKey", null);
assert(!ctx4.has("nullKey"), "has() returns false for null value");

// Timing
ctx4.recordTiming("TestAgent", 150);
ctx4.recordTiming("OtherAgent", 50);
assert(ctx4.timing.TestAgent === 150, "Timing recorded correctly");
assert(ctx4.totalProcessingMs === 200, "Total processing time sums correctly");
assert(ctx4.agentsRun.length === 2, "AgentsRun tracks order");
assert(ctx4.agentsRun[0] === "TestAgent", "AgentsRun maintains order");

// Errors
assert(!ctx4.hasErrors, "No errors initially");
ctx4.addError("TestAgent", "something went wrong");
assert(ctx4.hasErrors, "hasErrors after addError");
assert(ctx4.errors.length === 1, "Error count correct");
assert(ctx4.errors[0].agent === "TestAgent", "Error tracks agent name");

// Metrics
const metrics = ctx4.getAgentMetrics();
assert(metrics.agentsRun.length === 2, "Metrics include agents run");
assert(metrics.totalProcessingMs === 200, "Metrics include total time");
assert(metrics.errors.length === 1, "Metrics include errors");


// ═══════════════════════════════════════════════════
// 3. AgentRegistry Tests
// ═══════════════════════════════════════════════════
console.log("\n══ AgentRegistry Tests ══");

const registry = new AgentRegistry();

class AgentA extends BaseAgent {
  constructor() {
    super({ name: "AgentA", description: "A", requires: [], produces: ["dataA"] });
  }
  async run(ctx) { ctx.set("dataA", "hello"); }
}

class AgentB extends BaseAgent {
  constructor() {
    super({ name: "AgentB", description: "B", requires: ["dataA"], produces: ["dataB"] });
  }
  async run(ctx) { ctx.set("dataB", ctx.get("dataA") + " world"); }
}

class AgentC extends BaseAgent {
  constructor() {
    super({ name: "AgentC", description: "C", requires: ["dataB"], produces: ["dataC"] });
  }
  async run(ctx) { ctx.set("dataC", "final"); }
}

registry.register(new AgentA());
registry.register(new AgentB());
registry.register(new AgentC());

assert(registry.size === 3, "Registry has 3 agents");
assert(registry.has("AgentA"), "Registry has AgentA");
assert(!registry.has("AgentX"), "Registry doesn't have AgentX");
assert(registry.names().length === 3, "Registry names() returns all");

// Duplicate registration
try {
  registry.register(new AgentA());
  assert(false, "Duplicate registration should throw");
} catch (e) {
  assert(e.message.includes("already registered"), "Duplicate registration blocked");
}

// Execution order resolution
const order = registry.resolveExecutionOrder();
const orderNames = order.map(a => a.name);
assert(orderNames.indexOf("AgentA") < orderNames.indexOf("AgentB"), "A before B");
assert(orderNames.indexOf("AgentB") < orderNames.indexOf("AgentC"), "B before C");

// Filtered execution order
const filteredOrder = registry.resolveExecutionOrder(["AgentC", "AgentB", "AgentA"]);
const filteredNames = filteredOrder.map(a => a.name);
assert(filteredNames.indexOf("AgentA") < filteredNames.indexOf("AgentB"), "Filtered: A before B");

// Clear
registry.clear();
assert(registry.size === 0, "Registry cleared");


// ═══════════════════════════════════════════════════
// 4. AgentLogger Tests
// ═══════════════════════════════════════════════════
console.log("\n══ AgentLogger Tests ══");

const logger = new AgentLogger("Test");
assert(typeof logger.agentStart === "function", "Logger has agentStart");
assert(typeof logger.agentComplete === "function", "Logger has agentComplete");
assert(typeof logger.agentError === "function", "Logger has agentError");
assert(typeof logger.agentSkip === "function", "Logger has agentSkip");
assert(typeof logger.orchestrator === "function", "Logger has orchestrator");
assert(typeof logger.pipelineSummary === "function", "Logger has pipelineSummary");
assert(typeof logger.debug === "function", "Logger has debug");
assert(typeof logger.info === "function", "Logger has info");


// ═══════════════════════════════════════════════════
// 5. AgentOrchestrator Tests
// ═══════════════════════════════════════════════════
console.log("\n══ AgentOrchestrator Tests ══");

// Test with simple pipeline
(async () => {
  const orch = new AgentOrchestrator({ logger: new AgentLogger("OrcTest") });

  // Simple SchemaAgent mock
  class MockSchemaAgent extends BaseAgent {
    constructor() {
      super({
        name: "SchemaAgent",
        description: "Mock schema agent",
        requires: [],
        produces: ["dataset", "intelligence", "analysis", "datasetSummary"],
      });
    }
    async run(ctx) {
      ctx.set("dataset", [{ x: 1, y: 10 }, { x: 2, y: 20 }]);
      ctx.set("intelligence", { dataset: { domain: "Sales" } });
      ctx.set("analysis", { rowCount: 2, columns: ["x", "y"] });
      ctx.set("datasetSummary", { shape: "2 rows × 2 columns" });
    }
  }

  // Simple IntentAgent mock
  class MockIntentAgent extends BaseAgent {
    constructor() {
      super({
        name: "IntentAgent",
        description: "Mock intent agent",
        requires: ["dataset", "intelligence"],
        produces: ["intent", "queryClassification"],
      });
    }
    async run(ctx) {
      ctx.set("intent", { analysisType: "comparison", chartType: "bar", xAxis: "x", yAxis: "y" });
      ctx.set("queryClassification", { mode: "specific" });
    }
  }

  // Simple ComputeAgent mock
  class MockComputeAgent extends BaseAgent {
    constructor() {
      super({
        name: "ComputeAgent",
        description: "Mock compute agent",
        requires: ["dataset", "intent"],
        produces: ["computedData"],
      });
    }
    async run(ctx) {
      ctx.set("computedData", [{ x: 1, y: 10 }, { x: 2, y: 20 }]);
    }
  }

  // Simple VizAgent mock
  class MockVizAgent extends BaseAgent {
    constructor() {
      super({
        name: "VizAgent",
        description: "Mock viz agent",
        requires: ["intent"],
        produces: ["vizPlan"],
      });
    }
    async run(ctx) {
      ctx.set("vizPlan", { chartType: "bar", xAxis: "x", yAxis: "y" });
    }
  }

  // Simple InsightAgent mock
  class MockInsightAgent extends BaseAgent {
    constructor() {
      super({
        name: "InsightAgent",
        description: "Mock insight agent",
        requires: ["computedData"],
        produces: ["insights"],
      });
    }
    async run(ctx) {
      ctx.set("insights", { bulletPoints: ["Point 1", "Point 2"] });
    }
  }

  // Simple DomainAgent mock
  class MockDomainAgent extends BaseAgent {
    constructor() {
      super({
        name: "DomainAgent",
        description: "Mock domain agent",
        requires: ["dataset", "intelligence"],
        produces: ["domainReports"],
      });
    }
    async run(ctx) {
      ctx.set("domainReports", {});
    }
  }

  // Simple DashboardAgent mock
  class MockDashboardAgent extends BaseAgent {
    constructor() {
      super({
        name: "DashboardAgent",
        description: "Mock dashboard agent",
        requires: ["dataset", "intelligence", "analysis"],
        produces: ["dashboard"],
      });
    }
    async run(ctx) {
      ctx.set("dashboard", {
        dashboardMode: true,
        domain: "Sales",
        charts: [{ chartType: "bar", chartData: [{ name: "A", value: 10 }] }],
        kpis: { cards: [{ label: "Total", value: 100 }] },
      });
    }
  }

  // Register agents
  orch.registerAgent(new MockSchemaAgent());
  orch.registerAgent(new MockIntentAgent());
  orch.registerAgent(new MockComputeAgent());
  orch.registerAgent(new MockVizAgent());
  orch.registerAgent(new MockInsightAgent());
  orch.registerAgent(new MockDomainAgent());
  orch.registerAgent(new MockDashboardAgent());

  // ── Test Analyze Mode ──
  console.log("\n  ── Analyze Mode ──");
  const analyzeResult = await orch.run({ filePath: "/test.csv", query: "top 10 products" });

  assert(analyzeResult.chartType === "bar", "Analyze: chartType present");
  assert(Array.isArray(analyzeResult.chartData), "Analyze: chartData is array");
  assert(analyzeResult.chartData.length === 2, "Analyze: chartData has 2 rows");
  assert(typeof analyzeResult.insights === "string", "Analyze: insights is string");
  assert(Array.isArray(analyzeResult.insightBullets), "Analyze: insightBullets is array");
  assert(analyzeResult.insightBullets.length === 2, "Analyze: 2 insight bullets");
  assert(analyzeResult.intent.analysisType === "comparison", "Analyze: intent present");
  assert(analyzeResult.processingTimeMs >= 0, "Analyze: processingTimeMs present");
  assert(analyzeResult.datasetIntelligence !== null, "Analyze: intelligence attached");

  // ── Test Dashboard Mode ──
  console.log("\n  ── Dashboard Mode ──");
  const dashResult = await orch.run({ filePath: "/test.csv", query: "" });

  assert(dashResult.dashboardMode === true, "Dashboard: dashboardMode flag");
  assert(dashResult.domain === "Sales", "Dashboard: domain present");
  assert(Array.isArray(dashResult.charts), "Dashboard: charts array");
  assert(dashResult.charts.length > 0, "Dashboard: has charts");
  assert(dashResult.kpis !== undefined, "Dashboard: kpis present");

  // ── Test agent skipping with missing prerequisites ──
  console.log("\n  ── Prerequisite Skipping ──");
  const orch2 = new AgentOrchestrator({ logger: new AgentLogger("SkipTest") });

  // Agent that requires something never produced
  class OrphanAgent extends BaseAgent {
    constructor() {
      super({
        name: "IntentAgent",
        description: "Requires things never produced",
        requires: ["dataset", "intelligence"],
        produces: ["intent", "queryClassification"],
      });
    }
    async run(ctx) {
      ctx.set("intent", {});
      ctx.set("queryClassification", {});
    }
  }

  // Only register the orphan — no SchemaAgent to produce "dataset"
  orch2.registerAgent(new OrphanAgent());

  // This should not throw — orphan is skipped gracefully
  const skipResult = await orch2.run({ filePath: "/test.csv", query: "hello" });
  assert(skipResult !== null, "Skipped agents don't crash pipeline");
  assert(skipResult.chartData.length === 0, "Skipped pipeline produces empty chartData");

  // ── Test error resilience ──
  console.log("\n  ── Error Resilience ──");
  const orch3 = new AgentOrchestrator({ logger: new AgentLogger("ErrorTest") });

  class ErrorAgent extends BaseAgent {
    constructor() {
      super({
        name: "SchemaAgent",
        description: "Throws an error",
        requires: [],
        produces: ["dataset"],
      });
    }
    async run() {
      throw new Error("Intentional test error");
    }
  }

  orch3.registerAgent(new ErrorAgent());

  // Should not throw — errors are caught and recorded
  const errResult = await orch3.run({ filePath: "/test.csv", query: "test" });
  assert(errResult !== null, "Error in agent doesn't crash pipeline");

  // ═══════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════
  console.log(`\n══════════════════════════════════════`);
  console.log(`  Phase 1 Infrastructure Tests`);
  console.log(`  Passed: ${passed} | Failed: ${failed}`);
  console.log(`══════════════════════════════════════\n`);

  if (failed > 0) process.exit(1);
})();
