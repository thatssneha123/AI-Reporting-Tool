const path = require("path");
const datasetAgent = require("../orchestrator/agents/DatasetAgent");

async function testDatasetAgent() {
  console.log("Running DatasetAgent Unit Tests...\n");
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
    const sampleFilePath = path.join(__dirname, "../sample-data/sales.csv");
    console.log(`Testing DatasetAgent with file: ${sampleFilePath}`);

    const result = await datasetAgent.process(sampleFilePath);

    // Requirement 1: Domain Detection
    assert(typeof result.domain === "string" && result.domain.length > 0, `Domain detected: "${result.domain}"`);
    assert(typeof result.datasetType === "string", `Dataset type inferred: "${result.datasetType}"`);

    // Requirement 2: Dataset Profile
    assert(result.profile && typeof result.profile.rowCount === "number", `Profile rowCount: ${result.profile.rowCount}`);
    assert(typeof result.profile.columnCount === "number", `Profile columnCount: ${result.profile.columnCount}`);
    assert(Array.isArray(result.profile.numericColumns), `Numeric columns: ${result.profile.numericColumns.join(", ")}`);
    assert(Array.isArray(result.profile.categoricalColumns), `Categorical columns: ${result.profile.categoricalColumns.join(", ")}`);
    assert(Array.isArray(result.profile.dateColumns), "Date columns identified");
    assert(Array.isArray(result.profile.booleanColumns), "Boolean columns identified");

    // Requirement 3: Data Quality
    assert(result.quality && typeof result.quality.qualityScore === "number", `Quality score: ${result.quality.qualityScore}/100`);
    assert(result.quality.missingValues !== undefined, "Missing values recorded");
    assert(typeof result.quality.duplicateRows === "number", `Duplicate rows: ${result.quality.duplicateRows}`);
    assert(Array.isArray(result.quality.emptyColumns), "Empty columns array present");

    // Requirement 4: Statistical Analysis
    assert(result.statistics && typeof result.statistics.basic === "object", "Basic statistics computed");
    assert(typeof result.statistics.correlations === "object", "Correlations computed");
    assert(typeof result.statistics.outliers === "object", "Outlier detection performed");
    assert(typeof result.statistics.distribution === "object", "Distribution summary generated");

    // Requirement 5: Structured Dataset Summary
    assert(result.summary && typeof result.summary.shape === "string", `Summary shape: "${result.summary.shape}"`);
    assert(result.metadata && result.metadata.filename === "sales.csv", "Metadata present");

    // Requirement 6: Reusability and Backward Compatibility
    assert(Array.isArray(result.dataset) && result.dataset.length > 0, "Preserves raw dataset array for downstream agents");
    assert(result.intelligence !== undefined, "Preserves intelligence object for downstream agents");
    assert(result.analysis !== undefined, "Preserves analysis object for downstream agents");

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  }

  console.log(`\nDatasetAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testDatasetAgent();
