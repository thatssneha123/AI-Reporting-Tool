/**
 * Dashboard Data Computation Module (Enhanced)
 * Computes chart data for dashboard intents based on raw dataset
 * Handles dates, validates data quality, and skips problematic charts
 */

const { isHighQualityChart, suggestAlternativeChart } = require("./dashboardChartTitler");

/**
 * Compute chart data for a single chart intent
 * @param {Array} rawData - Raw dataset rows
 * @param {Object} chartIntent - {chartType, xAxis, yAxis, reason}
 * @param {Object} intelligence - Dataset intelligence with schema info
 * @returns {Array} Computed chart data
 */
function computeChartData(rawData, chartIntent, intelligence) {
  if (!rawData || rawData.length === 0) {
    return [];
  }

  const { xAxis, yAxis, chartType } = chartIntent;

  // Validate axes exist
  if (!xAxis || !yAxis) {
    return [];
  }

  try {
    // Transform data: convert dates to years, validate columns exist
    const transformedData = transformDataForChart(
      rawData,
      xAxis,
      yAxis,
      intelligence
    );

    if (transformedData.length === 0) {
      return [];
    }

    // Extract values after transformation
    const xValues = transformedData.map(row => row.x);
    const yValues = transformedData.map(row => row.y);

    // Aggregate data based on chart type
    let chartData;
    switch (chartType) {
      case "pie":
        chartData = computePieData(xValues, yValues);
        break;
      case "line":
        chartData = computeLineData(xValues, yValues, xAxis);
        break;
      case "bar":
        chartData = computeBarData(xValues, yValues);
        break;
      case "area":
        chartData = computeAreaData(xValues, yValues);
        break;
      case "scatter":
        chartData = computeScatterData(transformedData);
        break;
      default:
        chartData = computeBarData(xValues, yValues);
    }

    // Validate data quality before returning
    return sanitizeChartData(chartData);
  } catch (error) {
    console.error(`Error computing chart data for ${chartIntent.reason}:`, error.message);
    return [];
  }
}

/**
 * Transform data: convert dates to years, handle missing values
 */
function transformDataForChart(rawData, xAxis, yAxis, intelligence) {
  const { dateColumns = [], identifierColumns = [] } = intelligence.schema || {};
  const transformed = [];

  for (const row of rawData) {
    // Skip if row is missing required fields
    if (!(xAxis in row) || !(yAxis in row)) {
      continue;
    }

    let xVal = row[xAxis];
    let yVal = row[yAxis];

    // Skip if values are empty/null
    if (xVal === null || xVal === undefined || xVal === "") {
      continue;
    }

    // Convert date columns to years
    if (dateColumns.includes(xAxis)) {
      const date = new Date(xVal);
      if (Number.isFinite(date.getTime())) {
        xVal = date.getFullYear();
      } else {
        continue; // Skip invalid dates
      }
    }

    // For numeric y-axis, convert to number
    if (yAxis !== "count") {
      yVal = Number(yVal);
      if (!Number.isFinite(yVal)) {
        yVal = 0;
      }
    }

    // Convert x to string for grouping
    xVal = String(xVal).trim();

    // Skip empty strings
    if (!xVal) {
      continue;
    }

    transformed.push({ x: xVal, y: yVal });
  }

  return transformed;
}

/**
 * Sanitize chart data: remove undefined values, validate structure
 */
function sanitizeChartData(chartData) {
  if (!Array.isArray(chartData)) {
    return [];
  }

  return chartData.filter(point => {
    // Must have both name/x and value/y
    const hasName = point.name !== undefined && point.name !== null;
    const hasValue = point.value !== undefined && point.value !== null;

    // Name must not be string "undefined"
    const nameValid = !("name" in point) || String(point.name).toLowerCase() !== "undefined";

    // Value must be a finite number
    const valueValid = typeof point.value === "number" && Number.isFinite(point.value);

    return (hasName || point.x !== undefined) && hasValue && nameValid && valueValid;
  });
}


/**
 * Compute data for pie chart (category distribution)
 */
function computePieData(xValues, yValues) {
  const aggregated = {};

  xValues.forEach((x, idx) => {
    if (!aggregated[x]) {
      aggregated[x] = [];
    }
    const val = yValues[idx];
    if (Number.isFinite(val)) {
      aggregated[x].push(val);
    }
  });

  const result = Object.entries(aggregated)
    .map(([name, values]) => ({
      name: String(name).substring(0, 30).trim(),
      value: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
    }))
    .filter(item => item.name && Number.isFinite(item.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return result;
}

/**
 * Compute data for bar chart (categories with values)
 */
function computeBarData(xValues, yValues) {
  const aggregated = {};

  xValues.forEach((x, idx) => {
    const key = String(x).substring(0, 30).trim();
    if (key) {
      if (!aggregated[key]) {
        aggregated[key] = [];
      }
      const val = yValues[idx];
      if (Number.isFinite(val)) {
        aggregated[key].push(val);
      }
    }
  });

  const result = Object.entries(aggregated)
    .map(([name, values]) => ({
      name,
      value: Math.round(
        (values.reduce((a, b) => a + b, 0) / values.length) * 100
      ) / 100,
    }))
    .filter(item => item.name && Number.isFinite(item.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  return result;
}

/**
 * Compute data for line chart (time series)
 */
function computeLineData(xValues, yValues, xAxis) {
  const aggregated = {};

  xValues.forEach((x, idx) => {
    const key = String(x).substring(0, 20);
    if (!aggregated[key]) {
      aggregated[key] = [];
    }
    aggregated[key].push(yValues[idx] || 0);
  });

  return Object.entries(aggregated)
    .map(([name, values]) => ({
      name,
      value: Math.round(
        (values.reduce((a, b) => a + b, 0) / values.length) * 100
      ) / 100, // Average
    }))
    .sort((a, b) => {
      // Try to sort numerically first, then lexicographically
      const aNum = Number(a.name);
      const bNum = Number(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return String(a.name).localeCompare(String(b.name));
    });
}

/**
 * Compute data for area chart (similar to line)
 */
function computeAreaData(xValues, yValues) {
  return computeLineData(xValues, yValues);
}

/**
 * Compute data for scatter chart
 */
function computeScatterData(transformedData) {
  return transformedData
    .map(point => ({
      x: Number.isFinite(Number(point.x)) ? Number(point.x) : null,
      y: Number.isFinite(point.y) ? point.y : null,
    }))
    .filter(point => point.x !== null && point.y !== null)
    .slice(0, 500);
}

/**
 * Compute data for all dashboard charts
 * @param {Array} rawData - Raw dataset
 * @param {Array} charts - Chart intents from dashboardGenerator
 * @param {Object} intelligence - Dataset intelligence
 * @returns {Array} Charts with computed data and validated
 */
function computeAllChartData(rawData, charts, intelligence) {
  const { generateChartTitle } = require("./dashboardChartTitler");
  const domain = intelligence.dataset?.domain || "Generic";
  const schema = intelligence.schema || {};

  const chartsWithData = charts
    .map(chart => {
      const chartData = computeChartData(rawData, chart, intelligence);
      return {
        ...chart,
        chartData,
      };
    })
    .filter(chart => {
      // Filter out low-quality charts
      return isHighQualityChart(chart, chart.chartData);
    })
    .map(chart => {
      // Suggest alternatives for marginal charts
      const alternative = suggestAlternativeChart(chart, chart.chartData);
      if (alternative) {
        const altData = computeChartData(rawData, alternative, intelligence);
        if (isHighQualityChart(alternative, altData)) {
          chart = {
            ...alternative,
            chartData: altData,
          };
        }
      }
      
      // Generate intelligent title
      const title = generateChartTitle(chart, schema, domain);
      
      return {
        ...chart,
        chartType: chart.chartType || "bar",
        reason: title || chart.reason || "Chart",
      };
    });

  return chartsWithData;
}

/**
 * Compute domain-specific chart data for known domains
 */
function computeDomainSpecificCharts(rawData, domain, intelligence) {
  const schema = intelligence.schema || {};
  const charts = [];

  // Helper to find column by pattern
  const findColumn = (patterns) => {
    const allCols = schema.columns || Object.keys(rawData[0] || {});
    const col = allCols.find(c => 
      patterns.some(p => c.toLowerCase().includes(p.toLowerCase()))
    );
    return col;
  };

  // Helper to skip identifier columns
  const isIdentifierColumn = (col) => {
    return schema.identifierColumns?.includes(col) || /^id$|_id$|^uid$|^uuid$|^pk$/i.test(col);
  };

  switch (domain.toLowerCase()) {
    case "sales":
    case "orders":
      // Revenue Trend
      const dateCol = findColumn(["date", "time", "created"]);
      const revenueCol = findColumn(["revenue", "amount", "total", "sales", "price"]);
      if (dateCol && revenueCol && !isIdentifierColumn(revenueCol)) {
        charts.push({
          chartType: "line",
          xAxis: dateCol,
          yAxis: revenueCol,
          reason: "Revenue Trend",
        });
      }

      // By Region/Category
      const regionCol = findColumn(["region", "category", "type", "product"]);
      if (regionCol && revenueCol && !isIdentifierColumn(regionCol)) {
        charts.push({
          chartType: "bar",
          xAxis: regionCol,
          yAxis: revenueCol,
          reason: `Sales by ${regionCol}`,
        });
      }

      // Distribution
      if (revenueCol && regionCol) {
        charts.push({
          chartType: "pie",
          xAxis: regionCol,
          yAxis: revenueCol,
          reason: "Sales Distribution",
        });
      }
      break;

    case "movies":
    case "media":
      // Genre Distribution
      const genreCol = findColumn(["genre", "type", "category"]);
      if (genreCol && !isIdentifierColumn(genreCol)) {
        charts.push({
          chartType: "pie",
          xAxis: genreCol,
          yAxis: "count",
          reason: "Genre Distribution",
        });
      }

      // Movies vs TV Shows
      const typeCol = findColumn(["type", "show_type", "format", "category"]);
      if (typeCol && !isIdentifierColumn(typeCol)) {
        charts.push({
          chartType: "bar",
          xAxis: typeCol,
          yAxis: "count",
          reason: "Movies vs TV Shows",
        });
      }

      // Release Trend
      const yearCol = findColumn(["year", "release_date", "released", "date"]);
      if (yearCol) {
        charts.push({
          chartType: "line",
          xAxis: yearCol,
          yAxis: "count",
          reason: "Titles Released Over Years",
        });
      }

      // Rating Distribution
      const ratingCol = findColumn(["rating", "imdb_rating", "vote_average", "score"]);
      if (ratingCol && !isIdentifierColumn(ratingCol)) {
        charts.push({
          chartType: "bar",
          xAxis: ratingCol,
          yAxis: "count",
          reason: "Rating Distribution",
        });
      }

      // Director/Country top analysis
      const directorCol = findColumn(["director", "creator", "directors"]);
      if (directorCol && !isIdentifierColumn(directorCol)) {
        charts.push({
          chartType: "bar",
          xAxis: directorCol,
          yAxis: "count",
          reason: "Top Directors",
        });
      }

      const countryCol = findColumn(["country", "origin", "region"]);
      if (countryCol && !isIdentifierColumn(countryCol)) {
        charts.push({
          chartType: "bar",
          xAxis: countryCol,
          yAxis: "count",
          reason: "Top Countries",
        });
      }
      break;

    case "grocery":
    case "expense":
      const categoryCol = findColumn(["category", "type"]);
      const amountCol = findColumn(["amount", "total", "cost", "price", "spend"]);
      if (categoryCol && amountCol && !isIdentifierColumn(amountCol)) {
        charts.push({
          chartType: "pie",
          xAxis: categoryCol,
          yAxis: amountCol,
          reason: "Spending by Category",
        });
      }

      const itemCol = findColumn(["item", "product", "name"]);
      if (itemCol && amountCol && !isIdentifierColumn(itemCol)) {
        charts.push({
          chartType: "bar",
          xAxis: itemCol,
          yAxis: amountCol,
          reason: "Top Items by Spend",
        });
      }
      break;

    case "finance":
    case "accounting":
      const monthCol = findColumn(["month", "date", "period"]);
      const expenseCol = findColumn(["expense", "cost", "amount", "transaction"]);
      if (monthCol && expenseCol && !isIdentifierColumn(expenseCol)) {
        charts.push({
          chartType: "line",
          xAxis: monthCol,
          yAxis: expenseCol,
          reason: "Monthly Expenses",
        });
      }

      const expCatCol = findColumn(["category", "type", "account"]);
      if (expCatCol && expenseCol && !isIdentifierColumn(expenseCol)) {
        charts.push({
          chartType: "pie",
          xAxis: expCatCol,
          yAxis: expenseCol,
          reason: "Expense Distribution",
        });
      }
      break;

    case "hr":
    case "human resources":
      const deptCol = findColumn(["department", "team", "group"]);
      if (deptCol && !isIdentifierColumn(deptCol)) {
        charts.push({
          chartType: "pie",
          xAxis: deptCol,
          yAxis: "count",
          reason: "Employees by Department",
        });
      }

      const salaryCol = findColumn(["salary", "compensation", "pay"]);
      if (deptCol && salaryCol && !isIdentifierColumn(salaryCol)) {
        charts.push({
          chartType: "bar",
          xAxis: deptCol,
          yAxis: salaryCol,
          reason: "Avg Salary by Department",
        });
      }
      break;

    default:
      // Generic charts for unknown domains
      const numericCol = schema.numericalColumns?.find(c => !isIdentifierColumn(c));
      const catCol = schema.categoricalColumns?.find(c => !isIdentifierColumn(c));

      if (catCol && numericCol) {
        charts.push({
          chartType: "bar",
          xAxis: catCol,
          yAxis: numericCol,
          reason: `${catCol} Analysis`,
        });
      }
  }

  return charts.slice(0, 8); // Limit to 8 charts
}

module.exports = {
  computeChartData,
  computeAllChartData,
  computeDomainSpecificCharts,
  sanitizeChartData,
};
