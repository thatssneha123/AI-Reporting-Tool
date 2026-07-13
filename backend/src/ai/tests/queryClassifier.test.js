/**
 * Tests for Query Classification and Intent Enhancement
 * 
 * Covers:
 * - Vague vs specific query detection
 * - Intent category detection
 * - Query normalization
 * - Dashboard intent generation
 * - Domain mapping
 */

const {
  classifyQuery,
  detectIntentCategory,
  normalizeQuery,
  generateDashboardIntents,
  inferAnalysisTypeFromChart,
  domainToIntentCategories,
} = require("../modules/queryClassifier");

console.log("=== Query Classifier Tests ===\n");

// Test 1: Vague Query Detection
console.log("TEST 1: Vague Query Detection");
const vagueQueries = [
  "Analyze my data",
  "Show me a dashboard",
  "Generate a report",
  "What's a summary of this dataset?",
  "Create an overview",
  "Explore the data",
  "Business summary",
];
vagueQueries.forEach(q => {
  const result = classifyQuery(q);
  console.log(`  "${q}"`);
  console.log(`    -> Mode: ${result.mode}, Confidence: ${result.confidence}, Category: ${result.category}`);
  if (result.mode !== "dashboard") {
    console.warn(`    ✗ FAILED: Expected mode=dashboard, got ${result.mode}`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 2: Specific Query Detection
console.log("\nTEST 2: Specific Query Detection");
const specificQueries = [
  "Show top 10 products by revenue",
  "Compare sales vs expenses",
  "What's the trend over time?",
  "Distribute items by category",
  "Find correlation between A and B",
];
specificQueries.forEach(q => {
  const result = classifyQuery(q);
  console.log(`  "${q}"`);
  console.log(`    -> Mode: ${result.mode}, Confidence: ${result.confidence}, Category: ${result.category}`);
  if (result.mode !== "specific") {
    console.warn(`    ✗ FAILED: Expected mode=specific, got ${result.mode}`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 3: Intent Category Detection
console.log("\nTEST 3: Intent Category Detection");
const categoryTests = [
  { query: "monthly trend analysis", expected: "trend" },
  { query: "compare regions by sales", expected: "comparison" },
  { query: "top 10 products", expected: "top_n" },
  { query: "distribution of values", expected: "distribution" },
  { query: "correlation matrix", expected: "correlation" },
];
categoryTests.forEach(({ query, expected }) => {
  const result = detectIntentCategory(query);
  console.log(`  "${query}" -> ${result}`);
  if (result !== expected) {
    console.warn(`    ✗ FAILED: Expected ${expected}, got ${result}`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 4: Query Normalization
console.log("\nTEST 4: Query Normalization");
const normTests = [
  {
    input: "Can you please show me the top 5 items?",
    expected: "top 5 items",
  },
  {
    input: "Give me a summary of the data",
    expected: "summary of data",
  },
];
normTests.forEach(({ input, expected }) => {
  const result = normalizeQuery(input);
  console.log(`  Input: "${input}"`);
  console.log(`  Output: "${result}"`);
  // Check if normalized contains key parts
  const passes = expected.split(" ").every(word => result.includes(word));
  if (!passes) {
    console.warn(`    ✗ FAILED: Expected to contain "${expected}"`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 5: Chart Type to Analysis Type Conversion
console.log("\nTEST 5: Chart Type to Analysis Type Conversion");
const chartTests = [
  { chart: "line", expected: "trend" },
  { chart: "bar", expected: "comparison" },
  { chart: "pie", expected: "distribution" },
  { chart: "scatter", expected: "correlation" },
  { chart: "histogram", expected: "distribution" },
];
chartTests.forEach(({ chart, expected }) => {
  const result = inferAnalysisTypeFromChart(chart);
  console.log(`  Chart: ${chart} -> ${result}`);
  if (result !== expected) {
    console.warn(`    ✗ FAILED: Expected ${expected}, got ${result}`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 6: Domain to Intent Categories
console.log("\nTEST 6: Domain to Intent Categories");
const domainTests = [
  { domain: "Sales", expected: ["trend", "top_n", "comparison", "correlation"] },
  { domain: "Grocery", expected: ["comparison", "distribution", "summary", "trend"] },
  { domain: "HR", expected: ["distribution", "comparison", "summary"] },
];
domainTests.forEach(({ domain, expected }) => {
  const result = domainToIntentCategories(domain);
  console.log(`  Domain: ${domain}`);
  console.log(`    -> ${result.join(", ")}`);
  // Check first element matches
  if (result[0] !== expected[0]) {
    console.warn(`    ✗ FAILED: Expected first category ${expected[0]}, got ${result[0]}`);
  } else {
    console.log(`    ✓ PASSED`);
  }
});

// Test 7: Dashboard Intent Generation
console.log("\nTEST 7: Dashboard Intent Generation");
const mockIntelligence = {
  suggestions: {
    bestChartTypes: [
      { type: "bar", reason: "Category comparison", xAxis: "region", yAxis: "sales" },
      { type: "line", reason: "Trend analysis", xAxis: "month", yAxis: "revenue" },
      { type: "pie", reason: "Distribution", xAxis: "category", yAxis: "amount" },
    ],
    businessMetrics: [
      { name: "Total Revenue", formula: "sum(revenue)" },
    ],
  },
};
const mockAnalysis = {
  columns: ["region", "sales", "month", "revenue", "category", "amount"],
  columnTypes: { region: "categorical", sales: "numeric" },
};
const intents = generateDashboardIntents(mockIntelligence, mockAnalysis);
console.log(`  Generated ${intents.length} dashboard intents`);
if (intents.length === 0) {
  console.warn(`    ✗ FAILED: Expected intents, got none`);
} else {
  intents.forEach((intent, i) => {
    console.log(`    Intent ${i + 1}: ${intent.chartType} (${intent.analysisType})`);
  });
  console.log(`    ✓ PASSED`);
}

// Test 8: Similar Queries Normalization
console.log("\nTEST 8: Query Similarity via Normalization");
const similarQueries = [
  "Show top 10 cities by revenue",
  "Give me the top 10 cities by revenue",
  "Top 10 cities by revenue",
  "Can you show the top 10 cities by revenue?",
];
const normalized = similarQueries.map(q => normalizeQuery(q));
const allSame = normalized.every(n => n === normalized[0]);
console.log(`  Queries: ${similarQueries.length}`);
similarQueries.forEach((q, i) => {
  console.log(`    ${i + 1}. "${q}" -> "${normalized[i]}"`);
});
if (!allSame) {
  console.warn(`    ✗ FAILED: Not all queries normalized to same form`);
} else {
  console.log(`    ✓ PASSED: All similar queries map to same normalized form`);
}

console.log("\n=== Test Summary ===");
console.log("All manual tests completed. Review output above for any failures.");
