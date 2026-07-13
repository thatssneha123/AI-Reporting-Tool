/**
 * Dashboard Chart Title Generator
 * Generates intelligent, dataset-aware chart titles
 */

/**
 * Generate intelligent title for a chart based on data and context
 * @param {Object} chart - Chart object with {chartType, xAxis, yAxis, reason}
 * @param {Object} schema - Schema information
 * @param {String} domain - Dataset domain
 * @returns {String} Intelligent chart title
 */
function generateChartTitle(chart, schema = {}, domain = "Generic") {
  const { chartType, xAxis, yAxis, reason } = chart;
  const { categoricalColumns = [], dateColumns = [] } = schema;

  // Domain-specific titles
  const domainSpecific = generateDomainSpecificTitle(chart, domain, schema);
  if (domainSpecific) {
    return domainSpecific;
  }

  // Chart-type specific patterns
  switch (chartType) {
    case "line":
      if (dateColumns.includes(xAxis)) {
        return `${toTitleCase(yAxis)} Trend Over Time`;
      }
      return `${toTitleCase(yAxis)} Progression`;

    case "bar":
      if (categoricalColumns.includes(xAxis)) {
        return `${toTitleCase(yAxis)} by ${toTitleCase(xAxis)}`;
      }
      return `${toTitleCase(xAxis)} Analysis`;

    case "pie":
      return `${toTitleCase(yAxis)} Distribution by ${toTitleCase(xAxis)}`;

    case "area":
      if (dateColumns.includes(xAxis)) {
        return `${toTitleCase(yAxis)} Cumulative Trend`;
      }
      return `${toTitleCase(yAxis)} Over ${toTitleCase(xAxis)}`;

    case "scatter":
      return `${toTitleCase(xAxis)} vs ${toTitleCase(yAxis)} Correlation`;

    case "histogram":
      return `${toTitleCase(xAxis)} Distribution`;

    default:
      return reason || `${toTitleCase(xAxis)} Analysis`;
  }
}

/**
 * Generate domain-specific chart titles
 */
function generateDomainSpecificTitle(chart, domain, schema = {}) {
  const { chartType, xAxis, yAxis } = chart;
  const domainLower = domain.toLowerCase();

  // Movies domain
  if (domainLower === "movies" || domainLower === "media") {
    // Movies vs TV Shows distribution
    if (
      chartType === "pie" &&
      /type|format|category|show_type/i.test(xAxis)
    ) {
      return "Movies vs TV Shows";
    }

    // Genre distribution
    if (/genre/i.test(xAxis)) {
      return "Genre Distribution";
    }

    // Release year analysis
    if (/year|released/i.test(xAxis)) {
      if (chartType === "line" || chartType === "area") {
        return "Titles Released Over Years";
      }
      return "Release Year Distribution";
    }

    // Rating analysis
    if (/rating|imdb|vote|score/i.test(xAxis)) {
      if (chartType === "pie") {
        return "Rating Distribution";
      }
      return "Content by Rating";
    }

    // Director analysis
    if (/director|creator/i.test(xAxis)) {
      if (chartType === "bar") {
        return "Top Directors by Titles";
      }
      return "Director Analysis";
    }

    // Country analysis
    if (/country|region|origin/i.test(xAxis)) {
      return "Country Distribution";
    }

    // Duration analysis
    if (/duration|length|runtime/i.test(xAxis)) {
      return "Content Duration Distribution";
    }
  }

  // Sales domain
  if (domainLower === "sales" || domainLower === "orders") {
    // Revenue by region
    if (/region|territory|area|location/i.test(xAxis)) {
      if (/revenue|sales|amount/i.test(yAxis)) {
        return "Revenue by Region";
      }
      return "Sales by Region";
    }

    // Revenue trend
    if (/revenue|sales|amount/i.test(yAxis)) {
      if (/date|month|quarter|year/i.test(xAxis)) {
        return "Revenue Trend";
      }
      return "Total Revenue by Period";
    }

    // Product analysis
    if (/product|item|sku/i.test(xAxis)) {
      if (chartType === "bar") {
        return "Top Products by Revenue";
      }
      return "Product Performance";
    }

    // Category analysis
    if (/category|type|class/i.test(xAxis)) {
      return "Sales by Category";
    }

    // Customer analysis
    if (/customer|account|client/i.test(xAxis)) {
      return "Top Customers by Revenue";
    }
  }

  // Finance domain
  if (domainLower === "finance" || domainLower === "accounting") {
    // Monthly expense trend
    if (/month|quarter|period/i.test(xAxis)) {
      if (/expense|cost|amount/i.test(yAxis)) {
        return "Monthly Expenses";
      }
      return "Amount Over Time";
    }

    // Category distribution
    if (/category|type|class/i.test(xAxis)) {
      if (/expense|cost|amount/i.test(yAxis)) {
        return "Expense Distribution";
      }
      return "Amount by Category";
    }

    // Account analysis
    if (/account|balance|transaction/i.test(xAxis)) {
      return "Account Analysis";
    }
  }

  // HR domain
  if (domainLower === "hr" || domainLower === "human resources") {
    // Department distribution
    if (/department|team|group/i.test(xAxis)) {
      if (chartType === "pie") {
        return "Employee Distribution by Department";
      }
      if (/salary|compensation/i.test(yAxis)) {
        return "Average Salary by Department";
      }
      return "Department Analysis";
    }

    // Salary analysis
    if (/salary|compensation|pay/i.test(yAxis)) {
      if (/position|designation|level/i.test(xAxis)) {
        return "Salary by Position";
      }
      if (/department/i.test(xAxis)) {
        return "Salary Distribution";
      }
    }

    // Attendance
    if (/attendance|present|absent/i.test(xAxis) || /attendance/i.test(yAxis)) {
      return "Attendance Report";
    }
  }

  // Grocery/Expense domain
  if (domainLower === "grocery" || domainLower === "expense") {
    // Category spending
    if (/category|type|item/i.test(xAxis)) {
      if (chartType === "pie") {
        return "Spending by Category";
      }
      if (chartType === "bar") {
        return "Top Items by Spend";
      }
      return "Category Analysis";
    }

    // Spending trend
    if (/amount|total|cost|price/i.test(yAxis)) {
      if (/date|month/i.test(xAxis)) {
        return "Spending Trend";
      }
      return "Spending Distribution";
    }
  }

  // Inventory domain
  if (domainLower === "inventory") {
    // Stock by location
    if (/warehouse|location|store/i.test(xAxis)) {
      if (/stock|quantity|amount/i.test(yAxis)) {
        return "Stock by Warehouse";
      }
    }

    // Product inventory
    if (/product|item|sku/i.test(xAxis)) {
      return "Inventory by Product";
    }
  }

  // Education domain
  if (domainLower === "education") {
    // Score by class
    if (/class|section|grade|subject/i.test(xAxis)) {
      if (/score|mark|grade/i.test(yAxis)) {
        return "Average Score by Class";
      }
      return "Class Performance";
    }

    // Student distribution
    if (/student|enrollment/i.test(xAxis) || chartType === "pie") {
      return "Student Distribution";
    }
  }

  return null; // Use default formatting
}

/**
 * Validate chart is worth displaying
 * @returns {Boolean} true if chart should be included
 */
function isHighQualityChart(chart, chartData = []) {
  // Skip if no data
  if (!chartData || chartData.length === 0) {
    return false;
  }

  // Skip if chart has undefined or null values
  const hasUndefined = chartData.some(
    point =>
      point.name === undefined ||
      point.name === "undefined" ||
      point.value === undefined ||
      point.value === null ||
      (typeof point.name === "string" && point.name.toLowerCase() === "undefined")
  );

  if (hasUndefined) {
    return false;
  }

  // Skip single-value distributions (no variance)
  if (chartData.length === 1) {
    return false;
  }

  // Skip scatter plots with too few points
  if (chart.chartType === "scatter" && chartData.length < 3) {
    return false;
  }

  return true;
}

/**
 * Suggest alternative chart if current one is low quality
 * @returns {Object|null} Alternative chart suggestion or null
 */
function suggestAlternativeChart(chart, chartData = [], schema = {}) {
  const { chartType, xAxis, yAxis } = chart;

  // If bar chart has too many categories, suggest aggregation
  if (chartType === "bar" && chartData.length > 15) {
    return {
      ...chart,
      chartType: "pie",
      reason: `Top Categories (${chartData.length} items)`,
    };
  }

  // If scatter plot has too few points, use bar chart
  if (chartType === "scatter" && chartData.length < 5) {
    return {
      ...chart,
      chartType: "bar",
      reason: "Distribution Analysis",
    };
  }

  // If line chart has only one point, use bar chart
  if (chartType === "line" && chartData.length === 1) {
    return {
      ...chart,
      chartType: "bar",
      reason: "Value Comparison",
    };
  }

  return null;
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
  generateChartTitle,
  generateDomainSpecificTitle,
  isHighQualityChart,
  suggestAlternativeChart,
};
