function parseNumeric(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function cleanRow(row, columnTypes) {
  const cleaned = {};
  for (const [col, val] of Object.entries(row)) {
    const type = columnTypes[col];
    if (type === "numeric") {
      cleaned[col] = parseNumeric(val);
    } else if (type === "datetime") {
      const d = new Date(val);
      cleaned[col] = isNaN(d.getTime()) ? null : d.toISOString();
    } else if (type === "boolean") {
      const s = String(val).toLowerCase();
      cleaned[col] = ["true", "yes", "1"].includes(s) ? true : false;
    } else {
      cleaned[col] = val === undefined ? null : val;
    }
  }
  return cleaned;
}

function cleanDataset(dataset, columnTypes) {
  return dataset.map((row) => cleanRow(row, columnTypes));
}

function getMissingValueStats(dataset, columns) {
  const stats = {};
  for (const col of columns) {
    const total = dataset.length;
    const missing = dataset.filter(
      (row) => row[col] === null || row[col] === undefined || row[col] === ""
    ).length;
    stats[col] = {
      total,
      missing,
      missingPercent: total > 0 ? ((missing / total) * 100).toFixed(2) : "0.00",
      present: total - missing,
    };
  }
  return stats;
}

function dropMissingRows(dataset, columns) {
  return dataset.filter((row) =>
    columns.every((col) => row[col] !== null && row[col] !== undefined && row[col] !== "")
  );
}

function fillMissingNumeric(dataset, col, strategy = "mean") {
  const values = dataset
    .map((row) => row[col])
    .filter((v) => v !== null && v !== undefined);

  let fillValue;
  if (strategy === "mean") {
    fillValue = values.reduce((a, b) => a + b, 0) / values.length;
  } else if (strategy === "median") {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    fillValue = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  } else if (strategy === "zero") {
    fillValue = 0;
  }

  return dataset.map((row) => ({
    ...row,
    [col]: row[col] === null || row[col] === undefined ? fillValue : row[col],
  }));
}

module.exports = {
  cleanDataset,
  getMissingValueStats,
  dropMissingRows,
  fillMissingNumeric,
  parseNumeric,
};