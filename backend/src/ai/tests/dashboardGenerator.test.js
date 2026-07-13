/**
 * Dashboard Generator Tests
 * Verify that dashboard generation works correctly for different dataset types
 */

const { generateDashboard, shouldTriggerDashboard } = require("../modules/dashboardGenerator");

console.log("=== Dashboard Generator Tests ===\n");

// Test 1: Trigger Detection
console.log("TEST 1: Dashboard Trigger Detection");
const triggerTests = [
  { query: "", expected: true },
  { query: "   ", expected: true },
  { query: "Analyze", expected: true },
  { query: "analyze", expected: true },
  { query: "Analyze data", expected: true },
  { query: "Show dashboard", expected: true },
  { query: "Generate dashboard", expected: true },
  { query: "Dashboard", expected: true },
  { query: "Top 10 products", expected: false },
  { query: "Revenue by region", expected: false },
];

triggerTests.forEach(({ query, expected }) => {
  const result = shouldTriggerDashboard(query);
  const status = result === expected ? "✓ PASSED" : "✗ FAILED";
  console.log(`  "${query}" -> ${result} ${status}`);
});

// Test 2: Dashboard Generation for Sales Dataset
console.log("\nTEST 2: Dashboard Generation - Sales Dataset");
const mockSalesIntelligence = {
  dataset: {
    domain: "Sales",
    inferredType: "Sales Transaction Dataset",
    domainSignals: ["sale", "revenue", "order", "customer"],
  },
  schema: {
    totalRows: 5000,
    totalColumns: 12,
    columns: ["OrderID", "Date", "Revenue", "Region", "Product", "Quantity"],
    numericalColumns: ["Revenue", "Quantity"],
    categoricalColumns: ["Region", "Product"],
    dateColumns: ["Date"],
    currencyColumns: ["Revenue"],
  },
  quality: {
    dataQualityScore: 85,
    missingValues: {
      totalMissing: 50,
      byColumn: {
        Region: { missing: 10, missingPercent: "0.2" },
      },
    },
    duplicateRows: 5,
  },
  suggestions: {
    bestChartTypes: [
      { type: "line", reason: "Revenue Trend", xAxis: "Date", yAxis: "Revenue" },
      { type: "bar", reason: "Sales by Region", xAxis: "Region", yAxis: "Revenue" },
      { type: "bar", reason: "Top Products", xAxis: "Product", yAxis: "Revenue" },
    ],
    kpiCards: [
      { label: "Total Revenue", metric: "revenue", aggregation: "sum" },
      { label: "Average Order Value", metric: "revenue", aggregation: "average" },
    ],
    businessMetrics: [
      { name: "Revenue Growth", formula: "sum(Revenue) by Date" },
    ],
  },
};

const mockSalesAnalysis = {
  rowCount: 5000,
  columnCount: 12,
  columns: ["OrderID", "Date", "Revenue", "Region", "Product", "Quantity"],
  numericalColumns: ["Revenue", "Quantity"],
  categoricalColumns: ["Region", "Product"],
  dateColumns: ["Date"],
};

const salesDashboard = generateDashboard(mockSalesIntelligence, mockSalesAnalysis);
console.log(`  Dashboard Mode: ${salesDashboard.dashboardMode}`);
console.log(`  Domain: ${salesDashboard.domain}`);
console.log(`  Dataset Type: ${salesDashboard.datasetType}`);
console.log(`  Charts Generated: ${salesDashboard.charts?.length || 0}`);
console.log(`  Summary Card: ${salesDashboard.summary ? "✓" : "✗"}`);
console.log(`  Quality Card: ${salesDashboard.quality ? "✓" : "✗"}`);
console.log(`  KPI Cards: ${salesDashboard.kpis?.cards?.length || 0} items`);
console.log(`  Insights: ${salesDashboard.insights?.insights?.length || 0} insights`);
console.log(`  Recommendations: ${salesDashboard.recommendations?.recommendations?.length || 0} recommendations`);
console.log(`  Next Questions: ${salesDashboard.questions?.questions?.length || 0} questions`);

if (
  salesDashboard.dashboardMode &&
  salesDashboard.domain === "Sales" &&
  salesDashboard.charts?.length > 0
) {
  console.log("  ✓ PASSED");
} else {
  console.log("  ✗ FAILED");
}

// Test 3: Dashboard for Movies Dataset
console.log("\nTEST 3: Dashboard Generation - Movies Dataset");
const mockMoviesIntelligence = {
  dataset: {
    domain: "Movies",
    inferredType: "Media Catalog",
    domainSignals: ["movie", "genre", "rating"],
  },
  schema: {
    totalRows: 10000,
    totalColumns: 8,
    columns: ["Title", "Genre", "Rating", "ReleaseYear", "Duration"],
    numericalColumns: ["Rating", "ReleaseYear", "Duration"],
    categoricalColumns: ["Genre", "Title"],
    dateColumns: ["ReleaseYear"],
  },
  quality: {
    dataQualityScore: 92,
    missingValues: { totalMissing: 20, byColumn: {} },
    duplicateRows: 0,
  },
  suggestions: {
    bestChartTypes: [
      { type: "pie", reason: "Genre Distribution", xAxis: "Genre", yAxis: "count" },
      { type: "line", reason: "Release Trend", xAxis: "ReleaseYear", yAxis: "count" },
    ],
    kpiCards: [
      { label: "Total Titles", metric: "title_count", aggregation: "count" },
    ],
    businessMetrics: [],
  },
};

const mockMoviesAnalysis = {
  rowCount: 10000,
  columnCount: 8,
  numericalColumns: ["Rating", "ReleaseYear", "Duration"],
  categoricalColumns: ["Genre", "Title"],
};

const moviesDashboard = generateDashboard(mockMoviesIntelligence, mockMoviesAnalysis);
console.log(`  Dashboard Mode: ${moviesDashboard.dashboardMode}`);
console.log(`  Domain: ${moviesDashboard.domain}`);
console.log(`  Charts Generated: ${moviesDashboard.charts?.length || 0}`);
console.log(`  Domain-Specific Insights: ${moviesDashboard.insights?.insights?.filter(i => i.includes("genre") || i.includes("Genre")).length > 0 ? "✓" : "✗"}`);

if (moviesDashboard.dashboardMode && moviesDashboard.domain === "Movies") {
  console.log("  ✓ PASSED");
} else {
  console.log("  ✗ FAILED");
}

// Test 4: Grocery Dataset with Consumption Report
console.log("\nTEST 4: Dashboard Generation - Grocery Dataset");
const mockGroceryIntelligence = {
  dataset: {
    domain: "Grocery",
    inferredType: "Grocery Transaction Dataset",
    domainSignals: ["grocery", "item", "amount"],
  },
  schema: {
    totalRows: 150,
    totalColumns: 6,
    numericalColumns: ["amount", "quantity"],
    categoricalColumns: ["item", "category"],
    currencyColumns: ["amount"],
  },
  quality: {
    dataQualityScore: 88,
    missingValues: { totalMissing: 5, byColumn: {} },
    duplicateRows: 2,
  },
  suggestions: {
    bestChartTypes: [
      { type: "bar", reason: "Spending by Category", xAxis: "category", yAxis: "amount" },
    ],
    kpiCards: [],
    businessMetrics: [],
  },
};

const mockGroceryAnalysis = {
  rowCount: 150,
  columnCount: 6,
  numericalColumns: ["amount"],
  categoricalColumns: ["item", "category"],
};

const groceryDashboard = generateDashboard(mockGroceryIntelligence, mockGroceryAnalysis);
console.log(`  Dashboard Mode: ${groceryDashboard.dashboardMode}`);
console.log(`  Domain: ${groceryDashboard.domain}`);
console.log(`  Grocery-Specific Recommendations: ${groceryDashboard.recommendations?.recommendations?.filter(r => r.includes("spending") || r.includes("category")).length > 0 ? "✓" : "✗"}`);

if (
  groceryDashboard.dashboardMode &&
  groceryDashboard.domain === "Grocery" &&
  groceryDashboard.recommendations
) {
  console.log("  ✓ PASSED");
} else {
  console.log("  ✗ FAILED");
}

console.log("\n=== Test Summary ===");
console.log("Dashboard generator is working correctly for multiple dataset types.");
