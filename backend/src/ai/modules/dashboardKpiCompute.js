/**
 * Dashboard KPI Computation Module
 * Computes actual KPI values from dataset instead of just storing field names
 */

/**
 * Compute KPI card values from dataset
 * @param {Array} dataset - Raw dataset
 * @param {Array} kpiSuggestions - KPI suggestions from intelligence
 * @param {Object} schema - Schema information
 * @returns {Array} KPI cards with computed values
 */
function computeKpiValues(dataset, kpiSuggestions, schema = {}) {
  if (!Array.isArray(dataset) || dataset.length === 0) {
    return [];
  }

  const computedCards = [];

  for (const kpi of kpiSuggestions) {
    const computed = computeSingleKpi(dataset, kpi, schema);
    if (computed) {
      computedCards.push(computed);
    }
  }

  return computedCards;
}

/**
 * Compute a single KPI value
 */
function computeSingleKpi(dataset, kpi, schema) {
  const { metric, aggregation, label } = kpi;

  try {
    let value;
    let trend = "stable";

    switch (aggregation) {
      case "count":
        // Total row count
        value = dataset.length;
        break;

      case "sum":
        // Sum of numeric column
        value = computeSum(dataset, metric);
        break;

      case "average":
      case "avg":
        // Average of numeric column
        value = computeAverage(dataset, metric);
        break;

      case "distinct_count":
        // Count unique values in column
        value = computeDistinctCount(dataset, metric);
        break;

      case "min_max":
        // Date range
        value = computeDateRange(dataset, metric);
        break;

      case "count_by_type":
        // Count of records by type (e.g., Movies vs TV Shows)
        value = computeCountByType(dataset, metric);
        break;

      case "average_by_category":
        // Average of a column
        value = computeAverage(dataset, metric);
        break;

      default:
        return null;
    }

    if (value === null || value === undefined) {
      return null;
    }

    // Format value appropriately
    const formatted = formatKpiValue(value, label, metric, schema);

    return {
      label,
      value: formatted,
      trend,
      rawValue: value, // For sorting/calculations
    };
  } catch (error) {
    console.error(`Error computing KPI ${label}:`, error.message);
    return null;
  }
}

/**
 * Sum values in column
 */
function computeSum(dataset, column) {
  let sum = 0;
  for (const row of dataset) {
    const val = Number(row[column]);
    if (Number.isFinite(val)) {
      sum += val;
    }
  }
  return sum;
}

/**
 * Average of column values
 */
function computeAverage(dataset, column) {
  let sum = 0;
  let count = 0;

  for (const row of dataset) {
    const val = Number(row[column]);
    if (Number.isFinite(val)) {
      sum += val;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Count distinct values in column
 */
function computeDistinctCount(dataset, column) {
  const seen = new Set();
  for (const row of dataset) {
    const val = row[column];
    if (val !== null && val !== undefined && val !== "") {
      seen.add(String(val).trim());
    }
  }
  return seen.size;
}

/**
 * Get min and max of date column (formatted as range)
 */
function computeDateRange(dataset, column) {
  let minDate = null;
  let maxDate = null;

  for (const row of dataset) {
    const val = row[column];
    if (val) {
      const date = new Date(val);
      if (Number.isFinite(date.getTime())) {
        const year = date.getFullYear();
        if (!minDate || year < minDate) minDate = year;
        if (!maxDate || year > maxDate) maxDate = year;
      }
    }
  }

  if (minDate && maxDate) {
    return `${minDate} - ${maxDate}`;
  }
  return null;
}

/**
 * Count records by type (for Movies: Movies vs TV Shows)
 */
function computeCountByType(dataset, column) {
  const counts = {};
  for (const row of dataset) {
    const val = String(row[column] || "Unknown").trim();
    counts[val] = (counts[val] || 0) + 1;
  }

  // Format as readable summary
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");

  return entries || "0";
}

/**
 * Format KPI value for display
 */
function formatKpiValue(value, label, metric, schema = {}) {
  // Handle string values (like date ranges or counts by type)
  if (typeof value === "string") {
    return value;
  }

  // Check if this is a currency field
  const isCurrency =
    schema.currencyColumns?.includes(metric) ||
    /amount|price|cost|revenue|salary|total|bill/i.test(metric);

  // Check if this is a decimal field
  const isDecimal =
    /rate|percent|average|avg|score|rating|precision/i.test(metric);

  if (isCurrency) {
    // Format as currency
    return formatCurrency(value);
  }

  if (isDecimal) {
    // Format with 2 decimal places
    return Math.round(value * 100) / 100;
  }

  // Format as integer
  return Math.round(value);
}

/**
 * Format number as currency
 */
function formatCurrency(value) {
  if (value >= 1000000) {
    return "$" + (Math.round(value / 100000) / 10).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return "$" + (Math.round(value / 100) / 10).toFixed(1) + "K";
  }
  return "$" + Math.round(value);
}

/**
 * Generate domain-specific KPI suggestions with actual computation
 */
function generateSmartKpis(dataset, domain, schema) {
  const { numericalColumns = [], currencyColumns = [], dateColumns = [], categoricalColumns = [] } = schema;

  const kpis = [];

  // Always include total rows
  kpis.push({
    label: "Total Records",
    metric: "row_count",
    aggregation: "count",
  });

  // Domain-specific KPIs
  switch (domain.toLowerCase()) {
    case "sales":
    case "orders":
      if (currencyColumns.length) {
        kpis.push({
          label: "Total Revenue",
          metric: currencyColumns[0],
          aggregation: "sum",
        });
        kpis.push({
          label: "Avg Order Value",
          metric: currencyColumns[0],
          aggregation: "average",
        });
      }
      if (categoricalColumns.length) {
        kpis.push({
          label: `Unique ${toTitleCase(categoricalColumns[0])}`,
          metric: categoricalColumns[0],
          aggregation: "distinct_count",
        });
      }
      break;

    case "movies":
    case "media":
      // Count movies vs TV shows
      const typeCol = categoricalColumns.find(c =>
        /type|show|category|format/i.test(c)
      );
      if (typeCol) {
        kpis.push({
          label: "Movies & Shows",
          metric: typeCol,
          aggregation: "count_by_type",
        });
      } else {
        kpis.push({
          label: "Total Titles",
          metric: categoricalColumns[0] || "title",
          aggregation: "distinct_count",
        });
      }

      // Average rating
      const ratingCol = numericalColumns.find(c =>
        /rating|score|imdb|vote/i.test(c)
      );
      if (ratingCol) {
        kpis.push({
          label: "Avg Rating",
          metric: ratingCol,
          aggregation: "average",
        });
      }

      // Release year range
      if (dateColumns.length) {
        kpis.push({
          label: "Release Years",
          metric: dateColumns[0],
          aggregation: "min_max",
        });
      }

      // Count unique directors/genres
      const directorCol = categoricalColumns.find(c =>
        /director|creator/i.test(c)
      );
      if (directorCol) {
        kpis.push({
          label: "Unique Directors",
          metric: directorCol,
          aggregation: "distinct_count",
        });
      }

      const genreCol = categoricalColumns.find(c => /genre/i.test(c));
      if (genreCol) {
        kpis.push({
          label: "Genres",
          metric: genreCol,
          aggregation: "distinct_count",
        });
      }
      break;

    case "grocery":
    case "expense":
      if (currencyColumns.length) {
        kpis.push({
          label: "Total Spent",
          metric: currencyColumns[0],
          aggregation: "sum",
        });
        kpis.push({
          label: "Avg Transaction",
          metric: currencyColumns[0],
          aggregation: "average",
        });
      }
      if (categoricalColumns.length) {
        kpis.push({
          label: `Item Types`,
          metric: categoricalColumns[0],
          aggregation: "distinct_count",
        });
      }
      break;

    case "finance":
    case "accounting":
      if (currencyColumns.length) {
        kpis.push({
          label: "Total Amount",
          metric: currencyColumns[0],
          aggregation: "sum",
        });
      }
      if (dateColumns.length) {
        kpis.push({
          label: "Time Period",
          metric: dateColumns[0],
          aggregation: "min_max",
        });
      }
      break;

    case "hr":
    case "human resources":
      const salaryCol = currencyColumns.find(c => /salary|compensation/i.test(c));
      if (salaryCol) {
        kpis.push({
          label: "Avg Salary",
          metric: salaryCol,
          aggregation: "average",
        });
      }
      const empCol = categoricalColumns.find(c =>
        /employee|department|team/i.test(c)
      );
      if (empCol) {
        kpis.push({
          label: `Departments`,
          metric: empCol,
          aggregation: "distinct_count",
        });
      }
      break;

    default:
      // Generic numeric and categorical KPIs
      if (currencyColumns.length) {
        kpis.push({
          label: "Total Amount",
          metric: currencyColumns[0],
          aggregation: "sum",
        });
      }
      if (numericalColumns.length) {
        kpis.push({
          label: `Avg ${toTitleCase(numericalColumns[0])}`,
          metric: numericalColumns[0],
          aggregation: "average",
        });
      }
      if (categoricalColumns.length) {
        kpis.push({
          label: `Unique ${toTitleCase(categoricalColumns[0])}`,
          metric: categoricalColumns[0],
          aggregation: "distinct_count",
        });
      }
  }

  return kpis.slice(0, 8); // Limit to 8 KPIs
}

/**
 * Convert string to title case
 */
function toTitleCase(str) {
  return String(str)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = {
  computeKpiValues,
  computeSingleKpi,
  generateSmartKpis,
  formatCurrency,
};
