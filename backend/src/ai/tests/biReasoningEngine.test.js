const biReasoningEngine = require("../modules/biReasoningEngine");

function runBIReasoningTests() {
  console.log("=== BI Copilot Reasoning Engine Unit Tests ===\n");
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
    // Test 1: Grocery Dataset - "Where am I spending the most?"
    console.log("Test 1: Grocery Dataset Reasoning ('Where am I spending the most?')");
    const groceryMeta = {
      columns: ["item", "category", "amount", "date"],
      columnTypes: { item: "categorical", category: "categorical", amount: "numeric", date: "datetime" },
    };
    const groceryRes = biReasoningEngine.reasonAboutQuery("Where am I spending the most?", groceryMeta);
    assert(groceryRes.analysisType === "top_n", `Analysis type is ranking/top_n (${groceryRes.analysisType})`);
    assert(groceryRes.yAxis === "amount", `Matched metric to 'amount' (${groceryRes.yAxis})`);
    assert(groceryRes.xAxis === "category" || groceryRes.xAxis === "item", `Matched dimension to '${groceryRes.xAxis}'`);
    assert(groceryRes.chartType === "bar", `Visualization selected is bar chart (${groceryRes.chartType})`);

    // Test 2: Sales Dataset - "Which region has the highest sales?"
    console.log("\nTest 2: Sales Dataset Reasoning ('Which region has the highest sales?')");
    const salesMeta = {
      columns: ["region", "product", "sales", "order_date"],
      columnTypes: { region: "categorical", product: "categorical", sales: "numeric", order_date: "datetime" },
    };
    const salesRes = biReasoningEngine.reasonAboutQuery("Which region has the highest sales?", salesMeta);
    assert(salesRes.yAxis === "sales", `Matched metric to 'sales' (${salesRes.yAxis})`);
    assert(salesRes.xAxis === "region", `Matched dimension to 'region' (${salesRes.xAxis})`);
    assert(salesRes.chartType === "bar", `Visualization selected is bar chart (${salesRes.chartType})`);

    // Test 3: HR Dataset - "What is the average salary by department?"
    console.log("\nTest 3: HR Dataset Reasoning ('What is the average salary by department?')");
    const hrMeta = {
      columns: ["employee", "department", "salary", "hire_date"],
      columnTypes: { employee: "categorical", department: "categorical", salary: "numeric", hire_date: "datetime" },
    };
    const hrRes = biReasoningEngine.reasonAboutQuery("What is the average salary by department?", hrMeta);
    assert(hrRes.yAxis === "salary", `Matched metric to 'salary' (${hrRes.yAxis})`);
    assert(hrRes.xAxis === "department", `Matched dimension to 'department' (${hrRes.xAxis})`);
    assert(hrRes.aggregation === "average", `Aggregation method is 'average' (${hrRes.aggregation})`);

    // Test 4: Finance Dataset - "Monthly revenue trend over time"
    console.log("\nTest 4: Finance Dataset Reasoning ('Monthly revenue trend over time')");
    const financeMeta = {
      columns: ["month", "revenue", "profit"],
      columnTypes: { month: "datetime", revenue: "numeric", profit: "numeric" },
    };
    const financeRes = biReasoningEngine.reasonAboutQuery("Monthly revenue trend over time", financeMeta);
    assert(financeRes.analysisType === "trend", `Analysis type is trend (${financeRes.analysisType})`);
    assert(financeRes.yAxis === "revenue", `Matched metric to 'revenue' (${financeRes.yAxis})`);
    assert(financeRes.xAxis === "month", `Matched dimension to 'month' (${financeRes.xAxis})`);
    assert(financeRes.chartType === "line", `Visualization selected is line chart (${financeRes.chartType})`);

    // Test 5: Healthcare Dataset - "Correlation between age and score"
    console.log("\nTest 5: Healthcare Dataset Reasoning ('Correlation between age and score')");
    const healthMeta = {
      columns: ["patient_id", "age", "score", "department"],
      columnTypes: { patient_id: "categorical", age: "numeric", score: "numeric", department: "categorical" },
    };
    const healthRes = biReasoningEngine.reasonAboutQuery("Correlation between age and score", healthMeta);
    assert(healthRes.analysisType === "correlation", `Analysis type is correlation (${healthRes.analysisType})`);
    assert(healthRes.chartType === "scatter", `Visualization selected is scatter chart (${healthRes.chartType})`);

    // Test 6: Refinement Integration
    console.log("\nTest 6: Refinement of Intent Objects");
    const fallbackIntent = { analysisType: "summary", chartType: "table" };
    const refined = biReasoningEngine.refineIntent(fallbackIntent, "Top 5 products by revenue", salesMeta);
    assert(refined.analysisType === "top_n", `Refined analysisType to top_n (${refined.analysisType})`);
    assert(refined.yAxis === "sales" || refined.yAxis === "revenue", `Refined yAxis metric (${refined.yAxis})`);
    assert(refined.chartType === "bar", `Refined chartType to bar (${refined.chartType})`);

  } catch (err) {
    console.error("Test error:", err);
    failed++;
  }

  console.log(`\nBI Copilot Reasoning Engine Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runBIReasoningTests();
