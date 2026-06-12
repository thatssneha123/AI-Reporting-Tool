function groupBy(dataset, column) {
  return dataset.reduce((groups, row) => {
    const key = String(row[column]);
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
    return groups;
  }, {});
}

function aggregateNumeric(values) {
  const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (nums.length === 0) return { count: 0, sum: 0, mean: 0, min: 0, max: 0, stddev: 0 };

  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / nums.length;
  const stddev = Math.sqrt(variance);

  return {
    count: nums.length,
    sum: parseFloat(sum.toFixed(4)),
    mean: parseFloat(mean.toFixed(4)),
    median: parseFloat(median.toFixed(4)),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: parseFloat(stddev.toFixed(4)),
  };
}

function groupByAggregate(dataset, groupCol, valueCol) {
  const groups = groupBy(dataset, groupCol);
  const result = [];
  for (const [key, rows] of Object.entries(groups)) {
    const values = rows.map((r) => r[valueCol]);
    result.push({
      [groupCol]: key,
      ...aggregateNumeric(values),
    });
  }
  return result.sort((a, b) => b.sum - a.sum);
}

function getValueCounts(dataset, column) {
  const counts = {};
  for (const row of dataset) {
    const key = String(row[column]);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count, percent: ((count / dataset.length) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count);
}

function correlate(dataset, colA, colB) {
  const pairs = dataset
    .map((row) => [parseFloat(row[colA]), parseFloat(row[colB])])
    .filter(([a, b]) => !isNaN(a) && !isNaN(b));

  if (pairs.length < 2) return null;

  const n = pairs.length;
  const meanA = pairs.reduce((s, [a]) => s + a, 0) / n;
  const meanB = pairs.reduce((s, [, b]) => s + b, 0) / n;

  let num = 0, denA = 0, denB = 0;
  for (const [a, b] of pairs) {
    num += (a - meanA) * (b - meanB);
    denA += Math.pow(a - meanA, 2);
    denB += Math.pow(b - meanB, 2);
  }

  const denom = Math.sqrt(denA * denB);
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(4));
}

function timeSeries(dataset, dateCol, valueCol) {
  return dataset
    .filter((row) => row[dateCol] && row[valueCol] !== null)
    .map((row) => ({ date: row[dateCol], value: parseFloat(row[valueCol]) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = { groupBy, aggregateNumeric, groupByAggregate, getValueCounts, correlate, timeSeries };