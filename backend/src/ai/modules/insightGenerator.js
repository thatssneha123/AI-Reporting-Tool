const fs = require("fs");
const path = require("path");
const { callLLMJson } = require("../services/llmService");

const insightPrompt = fs.readFileSync(
  path.join(__dirname, "../prompts/insightPrompt.txt"),
  "utf-8"
);

async function generateInsights(analysis, intent, computedData) {
  const fallbackInsights = () => buildLocalInsights(intent, computedData);

  try {
    // Prevent useless calls
    if (
      !computedData ||
      !Array.isArray(computedData) ||
      computedData.length === 0
    ) {
      return {
        bulletPoints: ["No meaningful data available"]
      };
    }

    if (process.env.USE_LLM_INSIGHTS !== "true") {
      return {
        bulletPoints: fallbackInsights()
      };
    }

    // Reduce token usage
    const sample = computedData.slice(0, 20);

    if (process.env.AI_DEBUG === "true") {
      console.log("\n===== INSIGHT INPUT =====");
      console.log("Analysis Type:", intent.analysisType);
      console.log(
        "Computed Data:",
        JSON.stringify(sample, null, 2)
      );
      console.log("=========================\n");
    }

    const prompt = insightPrompt
      .replace("{{query}}", intent.rawUserInput || "")
      .replace("{{analysisType}}", intent.analysisType || "")
      .replace(
        "{{dataSample}}",
        JSON.stringify(sample, null, 2)
      );

    const result = await callLLMJson(prompt, "");

    if (process.env.AI_DEBUG === "true") {
      console.log("\n===== INSIGHT RESPONSE =====");
      console.log(JSON.stringify(result, null, 2));
      console.log("============================\n");
    }

    if (
      result &&
      Array.isArray(result.bulletPoints) &&
      result.bulletPoints.length > 0
    ) {
      return {
        bulletPoints: result.bulletPoints
      };
    }

    return {
      bulletPoints: fallbackInsights()
    };

  } catch (err) {
    if (process.env.AI_DEBUG === "true") {
      console.error("\n===== INSIGHT ERROR =====");
      console.error(err);
      console.error("=========================\n");
    }

    return {
      bulletPoints: fallbackInsights()
    };
  }
}

function buildLocalInsights(intent, computedData) {
  if (!Array.isArray(computedData) || computedData.length === 0) {
    return ["No meaningful data available"];
  }

  const keys = Object.keys(computedData[0]);
  const labelKey = intent.xAxis && keys.includes(intent.xAxis) ? intent.xAxis : keys[0];
  const valueKey =
    (intent.yAxis && keys.includes(intent.yAxis) && intent.yAxis) ||
    keys.find((key) => key !== labelKey && computedData.some((row) => Number.isFinite(Number(row[key]))));

  if (!valueKey) {
    return [`Analyzed ${computedData.length} result rows for ${labelKey}.`];
  }

  const rows = computedData
    .map((row) => ({
      label: row[labelKey],
      value: Number(row[valueKey]),
    }))
    .filter((row) => Number.isFinite(row.value));

  if (rows.length === 0) {
    return [`Analyzed ${computedData.length} result rows for ${labelKey}.`];
  }

  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const average = total / rows.length;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const change = first && last ? last.value - first.value : 0;
  const changePct = first?.value ? (change / first.value) * 100 : null;

  const insights = [
    `${highest.label} has the highest ${valueKey} at ${formatNumber(highest.value)}.`,
    `${lowest.label} has the lowest ${valueKey} at ${formatNumber(lowest.value)}.`,
    `Average ${valueKey} across ${rows.length} groups is ${formatNumber(average)}.`,
  ];

  if (rows.length > 1 && changePct !== null && Number.isFinite(changePct)) {
    insights.push(
      `${valueKey} ${change >= 0 ? "increased" : "decreased"} from ${first.label} to ${last.label} by ${formatNumber(Math.abs(change))} (${Math.abs(changePct).toFixed(1)}%).`
    );
  }

  return insights.slice(0, 5);
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

module.exports = {
  generateInsights
};
