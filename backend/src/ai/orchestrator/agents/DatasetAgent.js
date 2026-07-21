const path = require("path");
const { loadDataset } = require("../../modules/datasetLoader");
const { analyzeDatasetIntelligence } = require("../../modules/datasetIntelligenceAgent");
const { analyzeDataset, summarizeAnalysis } = require("../../modules/datasetAnalyzer");

/**
 * DatasetAgent
 * Intelligent wrapper around Dataset Intelligence and Dataset Analyzer modules.
 * Profiles dataset, detects domain/quality, computes statistics & outliers,
 * and produces a structured JSON output for consumption by orchestrator & other agents.
 */
class DatasetAgent {
  /**
   * Process a dataset input (file path string or raw dataset array)
   * @param {string|Array} input - File path or raw rows
   * @param {Object} options - Metadata options (filename, fileType, etc.)
   * @returns {Promise<Object>} Structured dataset profile object
   */
  async process(input, options = {}) {
    let dataset;
    let filePath = null;

    if (typeof input === "string") {
      filePath = input;
      dataset = await loadDataset(filePath);
    } else if (Array.isArray(input)) {
      dataset = input;
      filePath = options.filePath || null;
    } else {
      throw new Error("Invalid input to DatasetAgent: expected file path string or dataset array");
    }

    const filename = options.filename || (filePath ? path.basename(filePath) : "dataset");
    const fileType = options.fileType || (filePath ? path.extname(filePath).replace(".", "") : "csv");

    // 1. Reuse existing Dataset Intelligence Agent logic
    const intelligence = analyzeDatasetIntelligence(dataset, {
      filename,
      fileType,
    });

    // 2. Reuse existing Dataset Analyzer logic
    const analysis = analyzeDataset(dataset);
    const summaryAnalysis = summarizeAnalysis(analysis);

    // Extract profile details from intelligence & analysis schemas
    const schema = intelligence.schema || {};
    const qualityData = intelligence.quality || {};

    const booleanColumns = (schema.columnProfiles || [])
      .filter((col) => col.type === "boolean")
      .map((col) => col.name);

    const emptyColumns = (schema.columnProfiles || [])
      .filter((col) => col.type === "empty" || col.missingPercent === 100)
      .map((col) => col.name);

    // 3. Outlier detection on numerical columns
    const outliers = computeOutliers(dataset, analysis.numericColumns || [], analysis.numericStats || {});

    // Build structured output for downstream agents & API response
    const profile = {
      rowCount: schema.totalRows || dataset.length,
      columnCount: schema.totalColumns || Object.keys(dataset[0] || {}).length,
      columns: schema.columns || analysis.columns || [],
      numericColumns: schema.numericalColumns || analysis.numericColumns || [],
      categoricalColumns: schema.categoricalColumns || analysis.categoricalColumns || [],
      dateColumns: schema.dateColumns || analysis.datetimeColumns || [],
      booleanColumns,
      currencyColumns: schema.currencyColumns || [],
      identifierColumns: schema.identifierColumns || [],
      columnProfiles: schema.columnProfiles || [],
    };

    const quality = {
      missingValues: qualityData.missingValues || { totalMissing: 0, byColumn: {} },
      duplicateRows: qualityData.duplicateRows || 0,
      emptyColumns,
      invalidValues: qualityData.missingValues?.totalMissing || 0,
      qualityScore: qualityData.dataQualityScore ?? analysis.qualityScore ?? 100,
    };

    const statistics = {
      basic: analysis.numericStats || {},
      correlations: analysis.correlations || {},
      outliers,
      distribution: analysis.categoricalStats || {},
    };

    const domain = intelligence.dataset?.domain || "Generic";
    const datasetType = intelligence.dataset?.inferredType || `${domain} Dataset`;

    return {
      // Reusable objects for downstream agents & backward compatibility
      dataset,
      filePath,
      intelligence,
      analysis,

      // Structured JSON report format
      datasetType,
      domain,
      domainConfidence: intelligence.dataset?.domainConfidence || 0.5,
      domainSignals: intelligence.dataset?.domainSignals || [],
      profile,
      quality,
      statistics,
      summary: summaryAnalysis,
      metadata: {
        filename,
        fileType,
        source: intelligence.source || { filename, fileType },
        processedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * Helper: Outlier detection using z-score method (z > 2.5)
 */
function computeOutliers(dataset, numericColumns, numericStats) {
  const outliers = {};
  for (const col of numericColumns.slice(0, 5)) {
    const stats = numericStats[col];
    if (!stats || !stats.stddev || stats.stddev === 0) continue;

    const colOutliers = dataset
      .filter((r) => r[col] != null && !isNaN(Number(r[col])))
      .map((r) => ({
        value: Number(r[col]),
        zScore: Number(((Number(r[col]) - stats.mean) / stats.stddev).toFixed(2)),
      }))
      .filter((item) => Math.abs(item.zScore) > 2.5)
      .slice(0, 10);

    if (colOutliers.length > 0) {
      outliers[col] = colOutliers;
    }
  }
  return outliers;
}

module.exports = new DatasetAgent();
