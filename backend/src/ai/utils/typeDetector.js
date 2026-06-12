function detectType(values) {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");

  if (nonNull.length === 0) return "empty";

  const numericCount = nonNull.filter((v) => !isNaN(Number(v)) && v !== "").length;
  if (numericCount / nonNull.length > 0.85) return "numeric";

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^\d{2}-\d{2}-\d{4}/,
    /^\w+ \d{1,2},? \d{4}/,
  ];
  const dateCount = nonNull.filter((v) =>
    datePatterns.some((p) => p.test(String(v)))
  ).length;
  if (dateCount / nonNull.length > 0.75) return "datetime";

  const boolValues = new Set(["true", "false", "yes", "no", "1", "0"]);
  const boolCount = nonNull.filter((v) =>
    boolValues.has(String(v).toLowerCase())
  ).length;
  if (boolCount / nonNull.length > 0.9) return "boolean";

  const uniqueRatio = new Set(nonNull.map((v) => String(v).toLowerCase())).size / nonNull.length;
  if (uniqueRatio < 0.15 || new Set(nonNull).size <= 20) return "categorical";

  return "text";
}

function detectColumnTypes(dataset) {
  if (!dataset || dataset.length === 0) return {};
  const columns = Object.keys(dataset[0]);
  const types = {};
  for (const col of columns) {
    const values = dataset.map((row) => row[col]);
    types[col] = detectType(values);
  }
  return types;
}

function getNumericColumns(columnTypes) {
  return Object.entries(columnTypes)
    .filter(([, t]) => t === "numeric")
    .map(([c]) => c);
}

function getCategoricalColumns(columnTypes) {
  return Object.entries(columnTypes)
    .filter(([, t]) => t === "categorical")
    .map(([c]) => c);
}

function getDatetimeColumns(columnTypes) {
  return Object.entries(columnTypes)
    .filter(([, t]) => t === "datetime")
    .map(([c]) => c);
}


function detectColumnTypes(rows) {
  const columns = Object.keys(rows[0]);
  const result = {};

  for (const col of columns) {
    const values = rows.map(r => r[col]);
    result[col] = detectType(values);
  }

  return result;
}

module.exports = {
  detectType,
  detectColumnTypes,
  getNumericColumns,
  getCategoricalColumns,
  getDatetimeColumns,
};