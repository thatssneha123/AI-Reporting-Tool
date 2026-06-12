const typeUtils = require("../utils/typeDetector");
const { cleanDataset, getMissingValueStats } = require("../utils/dataCleaner");
const { aggregateNumeric, getValueCounts, correlate } = require("../utils/aggregation");

function analyzeDataset(rawDataset) {
  if (!rawDataset || rawDataset.length === 0) {
    return { error: "Empty dataset" };
  }

  const columns = Object.keys(rawDataset[0]);
  const columnTypes = typeUtils.detectColumnTypes(rawDataset);
  const dataset = cleanDataset(rawDataset, columnTypes);
  const missingStats = getMissingValueStats(dataset, columns);

  const numericColumns = typeUtils.getNumericColumns(columnTypes);
  const categoricalColumns = typeUtils.getCategoricalColumns(columnTypes);
  const datetimeColumns = typeUtils.getDatetimeColumns(columnTypes);

  const numericStats = {};
  for (const col of numericColumns) {
    const values = dataset.map((row) => row[col]).filter((v) => v !== null);
    numericStats[col] = aggregateNumeric(values);
  }

  const categoricalStats = {};
  for (const col of categoricalColumns) {
    categoricalStats[col] = getValueCounts(dataset, col).slice(0, 10);
  }

  const correlations = {};
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const a = numericColumns[i];
        const b = numericColumns[j];
        const r = correlate(dataset, a, b);
        if (r !== null) correlations[`${a}_vs_${b}`] = r;
      }
    }
  }

  const qualityScore = calculateQualityScore(dataset, columns, missingStats);

  return {
    rowCount: dataset.length,
    columnCount: columns.length,
    columns,
    columnTypes,
    numericColumns,
    categoricalColumns,
    datetimeColumns,
    missingStats,
    numericStats,
    categoricalStats,
    correlations,
    qualityScore,
    sampleRows: dataset.slice(0, 5),
    cleanedDataset: dataset,
  };
}

function calculateQualityScore(dataset, columns, missingStats) {
  if (columns.length === 0) return 0;
  let totalMissingPct = 0;
  for (const col of columns) {
    totalMissingPct += parseFloat(missingStats[col]?.missingPercent || 0);
  }
  const avgMissing = totalMissingPct / columns.length;
  return Math.max(0, Math.round(100 - avgMissing));
}

function summarizeAnalysis(analysis) {
  return {
    shape: `${analysis.rowCount} rows × ${analysis.columnCount} columns`,
    typeBreakdown: {
      numeric: analysis.numericColumns.length,
      categorical: analysis.categoricalColumns.length,
      datetime: analysis.datetimeColumns.length,
    },
    qualityScore: analysis.qualityScore,
    topMissingColumns: Object.entries(analysis.missingStats)
      .filter(([, s]) => parseFloat(s.missingPercent) > 0)
      .sort((a, b) => parseFloat(b[1].missingPercent) - parseFloat(a[1].missingPercent))
      .slice(0, 3)
      .map(([col, s]) => ({ col, missingPercent: s.missingPercent })),
    strongCorrelations: Object.entries(analysis.correlations)
      .filter(([, r]) => Math.abs(r) > 0.6)
      .map(([pair, r]) => ({ pair, r })),
  };
}

module.exports = { analyzeDataset, summarizeAnalysis };
